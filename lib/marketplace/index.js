"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Marketplace = void 0;
const __1 = require("..");
const buildMarketplaceTx_1 = require("./buildMarketplaceTx");
const bitcoin = __importStar(require("bitcoinjs-lib"));
class Marketplace {
    constructor(options) {
        this.wallet = options.wallet;
        this.receiveAddress = options.receiveAddress;
        this.spendAddress = options.spendAddress;
        this.spendPubKey = options.spendPubKey;
        this.altSpendAddress = options.altSpendAddress;
        this.altSpendPubKey = options.altSpendPubKey;
        this.signer = options.signer;
        this.feeRate = options.feeRate;
    }
    /**
     * Should estimate the total amount of satoshi required to execute offers including fees
     **/
    getOffersCostEstimate(offers) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let costEstimate = 0;
            for (let i = 0; i < offers.length; i++) {
                //50000 represents total fees, 546 for dust provision, 1200 for dummy utxos
                let offerPrice = ((_a = offers[i]) === null || _a === void 0 ? void 0 : _a.price)
                    ? offers[i].price
                    : (_b = offers[i]) === null || _b === void 0 ? void 0 : _b.totalPrice;
                costEstimate += offerPrice + 50000 + 546 + 1200;
            }
            return costEstimate;
        });
    }
    selectSpendAddress(offers) {
        return __awaiter(this, void 0, void 0, function* () {
            const estimatedCost = yield this.getOffersCostEstimate(offers);
            if (yield this.canAddressAffordOffers(this.spendAddress, estimatedCost)) {
                this.selectedSpendAddress = this.spendAddress;
                this.selectedSpendPubkey = this.spendPubKey;
            }
            else if (yield this.canAddressAffordOffers(this.altSpendAddress, estimatedCost)) {
                this.selectedSpendAddress = this.altSpendAddress;
                this.selectedSpendPubkey = this.altSpendPubKey;
            }
            else {
                throw new Error('Not enough sats available to buy marketplace offers, need  ' +
                    estimatedCost + ' sats');
            }
        });
    }
    processMultipleBuys(orders, previousOrderTxId, remainingSats, index = 1, psbtBase64s = [], psbtHexs = [], txIds = []) {
        return __awaiter(this, void 0, void 0, function* () {
            if (index >= orders.length) {
                return { txIds, psbtHexs, psbtBase64s };
            }
            try {
                const order = orders[index];
                const marketPlaceBuy = new buildMarketplaceTx_1.BuildMarketplaceTransaction({
                    address: this.selectedSpendAddress,
                    pubKey: this.selectedSpendPubkey,
                    receiveAddress: this.receiveAddress,
                    psbtBase64: order.psbtBase64,
                    price: order.price,
                    wallet: this.wallet,
                });
                const { psbtBase64: filledOutBase64, remainingSats: updatedRemainingSats, } = yield marketPlaceBuy.psbtMultiBuilder(previousOrderTxId, remainingSats);
                const psbtPayload = yield this.signMarketplacePsbt(filledOutBase64, true);
                const result = yield this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(psbtPayload.signedPsbt);
                const txPayload = yield this.wallet.sandshrewBtcClient.bitcoindRpc.decodeRawTransaction(result.hex);
                const txId = txPayload.txid;
                psbtHexs.push(result.hex);
                txIds.push(txId);
                return yield this.processMultipleBuys(orders, txId, updatedRemainingSats, index + 1, psbtBase64s, psbtHexs, txIds);
            }
            catch (error) {
                //skip to the next if an error occurs
                return yield this.processMultipleBuys(orders, previousOrderTxId, remainingSats, index + 1, psbtBase64s, psbtHexs, txIds);
            }
        });
    }
    signMarketplacePsbt(psbt, finalize = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const spendAddressType = (0, __1.getAddressType)(this.selectedSpendAddress);
            let payload;
            switch (spendAddressType) {
                case __1.AddressType.P2TR: {
                    payload = yield this.signer.signAllTaprootInputs({
                        rawPsbt: psbt,
                        finalize,
                    });
                    break;
                }
                case __1.AddressType.P2WPKH: {
                    payload = yield this.signer.signAllSegwitInputs({
                        rawPsbt: psbt,
                        finalize,
                    });
                    break;
                }
            }
            return payload;
        });
    }
    processAllOffers(offers) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectSpendAddress(offers);
            const processedOffers = [];
            let externalSwap = false;
            const testnet = this.wallet.network == (0, __1.getNetwork)('testnet');
            for (const offer of offers) {
                if (offer.marketplace == 'omnisat') {
                    let newOffer = yield this.wallet.apiClient.getOmnisatOfferPsbt({
                        offerId: offer.offerId,
                        ticker: offer.ticker,
                        testnet,
                    });
                    if (newOffer != false) {
                        processedOffers.push(newOffer);
                    }
                }
                else if (offer.marketplace == 'unisat' && !testnet) {
                    let txId = yield this.externalSwap({
                        auctionId: offer.offerId,
                        bidPrice: offer.totalPrice,
                    });
                    if (txId != null)
                        processedOffers.push(txId);
                    externalSwap = true;
                    yield (0, __1.timeout)(2000);
                }
            }
            if (processedOffers.length < 1) {
                throw new Error('Offers  unavailable');
            }
            return {
                processed: externalSwap,
                processedOffers,
            };
        });
    }
    externalSwap(bid) {
        return __awaiter(this, void 0, void 0, function* () {
            const psbt = yield this.wallet.apiClient.initSwapBid({
                address: this.selectedSpendAddress,
                auctionId: bid.auctionId,
                bidPrice: bid.bidPrice,
                pubKey: this.selectedSpendPubkey,
                receiveAddress: this.receiveAddress
            });
            if (!(psbt === null || psbt === void 0 ? void 0 : psbt.error)) {
                const unsignedPsbt = psbt.psbtBid;
                const swapOptions = bid;
                swapOptions['psbt'] = unsignedPsbt;
                const signedPsbt = yield this.externalSign(swapOptions);
                const data = yield this.wallet.apiClient.submitSignedBid({
                    psbtBid: signedPsbt,
                    auctionId: bid.auctionId,
                    bidId: psbt.bidId,
                });
                if (data.txid)
                    return data.txid;
            }
            return null;
        });
    }
    buyMarketPlaceOffers(pOffers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pOffers.processed) {
                return pOffers.processedOffers;
            }
            const offers = pOffers.processedOffers;
            if (offers.length < 1)
                throw Error('No offers to buy');
            const marketPlaceBuy = new buildMarketplaceTx_1.BuildMarketplaceTransaction({
                address: this.selectedSpendAddress,
                pubKey: this.selectedSpendPubkey,
                receiveAddress: this.receiveAddress,
                psbtBase64: offers[0].psbtBase64,
                price: offers[0].price,
                wallet: this.wallet,
            });
            const preparedWallet = yield this.prepareAddress(marketPlaceBuy);
            yield (0, __1.timeout)(30000);
            if (!preparedWallet) {
                throw new Error('Address not prepared to buy marketplace offers');
            }
            const { psbtBase64, remainder } = yield marketPlaceBuy.psbtBuilder();
            const psbtPayload = yield this.signMarketplacePsbt(psbtBase64, true);
            const result = yield this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(psbtPayload.signedPsbt);
            const [broadcast] = yield this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
                result.hex,
            ]);
            if (!broadcast.allowed) {
                console.log('in buyMarketPlaceOffers', broadcast);
                throw new Error(result['reject-reason']);
            }
            yield this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(result.hex);
            const txPayload = yield this.wallet.sandshrewBtcClient.bitcoindRpc.decodeRawTransaction(result.hex);
            const txId = txPayload.txid;
            let remainingSats = remainder;
            const multipleBuys = yield this.processMultipleBuys(offers, txId, remainingSats, 1);
            const marketplaceTxns = [];
            marketplaceTxns.push(txId);
            for (let i = 0; i < multipleBuys.psbtHexs.length; i++) {
                yield (0, __1.timeout)(30000);
                const [broadcast] = yield this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
                    multipleBuys.psbtHexs[i],
                ]);
                if (!broadcast.allowed) {
                    console.log('Error in broadcasting tx: ' + multipleBuys.txIds[i]);
                    console.log(broadcast);
                    console.log(result['reject-reason']);
                    return {
                        marketplaceTxns,
                    };
                }
                yield this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(multipleBuys.psbtHexs[i]);
                marketplaceTxns.push(multipleBuys.txIds[i]);
            }
            return {
                marketplaceTxns,
            };
        });
    }
    prepareAddress(marketPlaceBuy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prepared = yield marketPlaceBuy.isWalletPrepared();
                if (!prepared) {
                    const { psbtBase64 } = yield marketPlaceBuy.prepareWallet();
                    const psbtPayload = yield this.signMarketplacePsbt(psbtBase64, true);
                    const result = yield this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(psbtPayload.signedPsbt);
                    const [broadcast] = yield this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
                        result.hex,
                    ]);
                    if (!broadcast.allowed) {
                        console.log('in prepareAddress', broadcast);
                        throw new Error(result['reject-reason']);
                    }
                    yield this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(result.hex);
                    return true;
                }
                return true;
            }
            catch (err) {
                console.log('Error', err);
                throw Error('An error occured while preparing address for marketplace buy');
            }
        });
    }
    canAddressAffordOffers(address, estimatedCost) {
        return __awaiter(this, void 0, void 0, function* () {
            const retrievedUtxos = yield this.getUTXOsToCoverAmount(address, estimatedCost);
            return retrievedUtxos.length > 0;
        });
    }
    externalSign(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const psbt = bitcoin.Psbt.fromHex(options.psbt, {
                network: this.wallet.network,
            });
            const psbtPayload = yield this.signMarketplacePsbt(psbt.toBase64(), false);
            return psbtPayload.signedHexPsbt;
        });
    }
    getUnspentsForAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                '=========== Getting all confirmed/unconfirmed utxos for ' +
                    address +
                    ' ============';
                return yield this.wallet.esploraRpc
                    .getAddressUtxo(address)
                    .then((unspents) => unspents === null || unspents === void 0 ? void 0 : unspents.filter((utxo) => utxo.value > 546));
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getUnspentsForAddressInOrderByValue(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const unspents = yield this.getUnspentsForAddress(address);
            console.log('=========== Confirmed Utxos len', unspents.length);
            return unspents.sort((a, b) => b.value - a.value);
        });
    }
    getUTXOsToCoverAmount(address, amountNeeded, inscriptionLocs) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('=========== Getting Unspents for address in order by value ========');
                const unspentsOrderedByValue = yield this.getUnspentsForAddressInOrderByValue(address);
                console.log('unspentsOrderedByValue len:', unspentsOrderedByValue.length);
                console.log('=========== Getting Collectibles for address ' +
                    address +
                    '========');
                const retrievedIxs = (yield this.wallet.apiClient.getCollectiblesByAddress(address)).data;
                console.log('=========== Collectibles:', retrievedIxs.length);
                console.log('=========== Gotten Collectibles, splitting utxos ========');
                const bisInscriptionLocs = retrievedIxs.map((utxo) => utxo.satpoint);
                if (bisInscriptionLocs.length === 0) {
                    inscriptionLocs = [];
                }
                else {
                    inscriptionLocs = bisInscriptionLocs;
                }
                let sum = 0;
                const result = [];
                try {
                    for (var _d = true, unspentsOrderedByValue_1 = __asyncValues(unspentsOrderedByValue), unspentsOrderedByValue_1_1; unspentsOrderedByValue_1_1 = yield unspentsOrderedByValue_1.next(), _a = unspentsOrderedByValue_1_1.done, !_a;) {
                        _c = unspentsOrderedByValue_1_1.value;
                        _d = false;
                        try {
                            let utxo = _c;
                            const currentUTXO = utxo;
                            const utxoSatpoint = (0, __1.getSatpointFromUtxo)(currentUTXO);
                            if ((inscriptionLocs &&
                                (inscriptionLocs === null || inscriptionLocs === void 0 ? void 0 : inscriptionLocs.find((utxoLoc) => utxoLoc === utxoSatpoint))) ||
                                currentUTXO.value <= 546) {
                                continue;
                            }
                            sum += currentUTXO.value;
                            result.push(currentUTXO);
                            if (sum > amountNeeded) {
                                console.log('AMOUNT RETRIEVED: ', sum);
                                return result;
                            }
                        }
                        finally {
                            _d = true;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = unspentsOrderedByValue_1.return)) yield _b.call(unspentsOrderedByValue_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return [];
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
}
exports.Marketplace = Marketplace;
//# sourceMappingURL=index.js.map