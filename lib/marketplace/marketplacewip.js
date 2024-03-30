"use strict";
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
                    // let txId = await this.externalSwap({
                    //   address: this.address,
                    //   auctionId: offer.offerId,
                    //   bidPrice: offer.totalPrice,
                    //   pubKey: this.publicKey,
                    //   mnemonic: this.mnemonic,
                    //   hdPath: this.hdPath,
                    //   type: this.addressType,
                    // })
                    // if (txId != null) processedOffers.push(txId)
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
    canAddressAffordOffers(address, estimatedCost) {
        return __awaiter(this, void 0, void 0, function* () {
            const retrievedUtxos = yield this.getUTXOsToCoverAmount(address, estimatedCost);
            return retrievedUtxos.length > 0;
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
//# sourceMappingURL=marketplacewip.js.map