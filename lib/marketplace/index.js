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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Marketplace = void 0;
const __1 = require("..");
const buildMarketplaceTx_1 = require("./buildMarketplaceTx");
const bitcoin = __importStar(require("bitcoinjs-lib"));
class Marketplace {
    constructor(options) {
        try {
            this.wallet = options.wallet;
            this.address = options.address;
            this.publicKey = options.publicKey;
            this.mnemonic = options.mnemonic;
            this.feeRate = options.feeRate;
            const addressType = (0, __1.getAddressType)(this.address);
            if (addressType == null)
                throw Error("Invalid Address Type");
            this.addressType = addressType;
        }
        catch (e) {
            throw Error("An error occured: \n" + e);
        }
    }
    processMultipleBuys(orders, previousOrderTxId, remainingSats, index = 1, psbtBase64s = [], psbtHexs = [], txIds = []) {
        return __awaiter(this, void 0, void 0, function* () {
            if (index >= orders.length) {
                return { txIds, psbtHexs, psbtBase64s };
            }
            const order = orders[index];
            const marketPlaceBuy = new buildMarketplaceTx_1.BuildMarketplaceTransaction({
                address: this.address,
                pubKey: this.publicKey,
                psbtBase64: order.psbtBase64,
                price: order.price,
                wallet: this.wallet
            });
            const { psbtBase64: filledOutBase64, remainingSats: updatedRemainingSats, psbtHex: filledOutPsbtHex, } = yield marketPlaceBuy.psbtMultiBuilder(previousOrderTxId, remainingSats);
            const tempPsbt = bitcoin.Psbt.fromHex(filledOutPsbtHex, {
                network: this.wallet.network,
            });
            const txSigner = yield this.getSigner();
            const signedPsbt = yield txSigner.signPsbt(tempPsbt, false);
            signedPsbt.finalizeAllInputs();
            psbtBase64s.push(signedPsbt.toBase64());
            const result = yield this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(signedPsbt.toBase64());
            psbtHexs.push(result.hex);
            const txId = signedPsbt.extractTransaction().getId();
            txIds.push(txId);
            return yield this.processMultipleBuys(orders, txId, updatedRemainingSats, index + 1, psbtBase64s, psbtHexs, txIds);
        });
    }
    getSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield this.wallet.fromPhrase({
                mnemonic: this.mnemonic.trim(),
                hdPath: this.hdPath,
                addrType: this.addressType,
            });
            if (payload.keyring.address != this.address)
                throw Error("Could not get signer for this address");
            const keyring = payload.keyring.keyring;
            const signer = keyring.signTransaction.bind(keyring);
            const tx = new __1.OGPSBTTransaction(signer, this.address, this.publicKey, this.addressType, this.wallet.network, this.feeRate);
            return tx;
        });
    }
    buyMarketPlaceOffers(offers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (offers.length < 1)
                throw Error("No offers to buy");
            const marketPlaceBuy = new buildMarketplaceTx_1.BuildMarketplaceTransaction({
                address: this.address,
                pubKey: this.publicKey,
                psbtBase64: offers[0].psbtBase64,
                price: offers[0].price,
                wallet: this.wallet
            });
            const preparedWallet = yield this.prepareAddress(marketPlaceBuy);
            if (!preparedWallet) {
                throw new Error("Address not prepared to buy marketplace offers");
            }
            const estimatedCost = yield this.getOffersCostEstimate(offers);
            const validateAffordability = yield marketPlaceBuy.checkAffordability(estimatedCost);
            if (!validateAffordability) {
                throw new Error("Address not have enough sats to buy marketplace offers, needs  " + estimatedCost + " sats");
            }
            const { psbtBase64, remainder, psbtHex } = yield marketPlaceBuy.psbtBuilder();
            const tempPsbt = bitcoin.Psbt.fromHex(psbtHex, {
                network: this.wallet.network,
            });
            const txSigner = yield this.getSigner();
            const signedPsbt = yield txSigner.signPsbt(tempPsbt, false);
            signedPsbt.finalizeAllInputs();
            const result = yield this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(signedPsbt.toBase64());
            const [broadcast] = yield this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([result.hex]);
            if (!broadcast.allowed) {
                console.log("in buyMarketPlaceOffers", broadcast);
                throw new Error(result['reject-reason']);
            }
            yield this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(result.hex);
            const txId = signedPsbt.extractTransaction().getId();
            let remainingSats = remainder;
            const multipleBuys = yield this.processMultipleBuys(offers, txId, remainingSats, 1);
            return {
                rootTx: txId,
                multipleBuys
            };
        });
    }
    processAllOffers(offers) {
        return __awaiter(this, void 0, void 0, function* () {
            const processedOffers = [];
            for (const offer of offers) {
                if (offer.marketplace == 'omnisat') {
                    let newOffer = yield this.wallet.apiClient.getOmnisatOfferPsbt({ offerId: offer.offerId, ticker: offer.ticker });
                    processedOffers.push(newOffer);
                }
            }
            return processedOffers;
        });
    }
    /**
     * should be able to check if an offer is still valid on the external marketplace
      should make request to the api (and force a refetch of the orderId
    **/
    checkIfOfferIsValid(offer) {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    /**
     * Should regularize an address in the event an address doesn't have
     required utxos for a psbt atomic swap
     */
    prepareAddress(marketPlaceBuy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prepared = yield marketPlaceBuy.isWalletPrepared();
                if (!prepared) {
                    const { psbtHex } = yield marketPlaceBuy.prepareWallet();
                    const tempPsbt = bitcoin.Psbt.fromHex(psbtHex, {
                        network: this.wallet.network,
                    });
                    const txSigner = yield this.getSigner();
                    const signedPsbt = yield txSigner.signPsbt(tempPsbt, false);
                    signedPsbt.finalizeAllInputs();
                    const result = yield this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(signedPsbt.toBase64());
                    const [broadcast] = yield this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([result.hex]);
                    if (!broadcast.allowed) {
                        console.log("in prepareAddress", broadcast);
                        throw new Error(result['reject-reason']);
                    }
                    yield this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(result.hex);
                    return true;
                }
                return true;
            }
            catch (err) {
                console.log("Error", err);
                throw Error("An error occured while preparing address for marketplace buy");
            }
        });
    }
    /**
     * Should estimate the total amount of satoshi required to execute offers including fees
     **/
    getOffersCostEstimate(offers) {
        return __awaiter(this, void 0, void 0, function* () {
            let costEstimate = 0;
            for (let i = 0; i < offers.length; i++) {
                //30000 represents fee rate, 546 for dust
                costEstimate += offers[i].price + 30000 + 546;
            }
            return costEstimate;
        });
    }
    /**
     * Should validate the txid is in the mempool
     **/
    validateTxidInMempool(txid) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.Marketplace = Marketplace;
//# sourceMappingURL=index.js.map