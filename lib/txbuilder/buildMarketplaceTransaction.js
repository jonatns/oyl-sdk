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
exports.BuildMarketplaceTransaction = void 0;
const apiclient_1 = require("../apiclient");
const sandshrew_1 = require("../rpclient/sandshrew");
const esplora_1 = require("../rpclient/esplora");
const utils_1 = require("../shared/utils");
const bitcoin = __importStar(require("bitcoinjs-lib"));
class BuildMarketplaceTransaction {
    constructor({ address, pubKey, feeRate, psbtBase64, price }) {
        this.walletAddress = address;
        this.pubKey = pubKey;
        this.apiClient = new apiclient_1.OylApiClient({ host: 'https://api.oyl.gg' });
        this.esploraRpc = new esplora_1.EsploraRpc("https://mainnet.sandshrew.io/v1/154f9aaa25a986241357836c37f8d71");
        this.sandshrewBtcClient = new sandshrew_1.SandshrewBitcoinClient("https://sandshrew.io/v1/d6aebfed1769128379aca7d215f0b689");
        this.feeRate = feeRate;
        this.psbtBase64 = psbtBase64;
        this.orderPrice = price;
    }
    getUTXOsToCoverAmount(amountNeeded, inscriptionLocs) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const unspentsOrderedByValue = yield this.getUnspentsForAddressInOrderByValue();
            const retrievedIxs = yield this.apiClient.getCollectiblesByAddress(this.walletAddress);
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
                        const utxoSatpoint = (0, utils_1.getSatpointFromUtxo)(currentUTXO);
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
        });
    }
    psbtBuilder() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const marketplacePsbt = bitcoin.Psbt.fromBase64(this.psbtBase64);
            const costPrice = this.orderPrice * 100000000;
            const requiredSatoshis = (costPrice) + 30000 + 546 + 1200;
            const retrievedUtxos = yield this.getUTXOsToCoverAmount(requiredSatoshis);
            if (retrievedUtxos.length === 0) {
                throw Error("Not enough funds to purchase this offer");
            }
            const allUtxosWorth600 = yield this.getAllUTXOsWorthASpecificValue(600);
            if (allUtxosWorth600.length < 2) {
                throw Error("not enough padding utxos (600 sat) for marketplace buy");
            }
            yield this.getMakersAddress();
            if (!this.makersAddress) {
                throw Error("Could not resolve maker's address");
            }
            const swapPsbt = new bitcoin.Psbt();
            for (let i = 0; i < 2; i++) {
                swapPsbt.addInput({
                    hash: allUtxosWorth600[i].tx_hash_big_endian,
                    index: allUtxosWorth600[i].tx_output_n,
                    witnessUtxo: {
                        value: allUtxosWorth600[i].value,
                        script: Buffer.from(allUtxosWorth600[i].script, 'hex'),
                    },
                    tapInternalKey: (0, utils_1.assertHex)(Buffer.from(this.pubKey, 'hex')),
                });
            }
            const takerInput = marketplacePsbt.txInputs[2];
            const takerInputData = marketplacePsbt.data.inputs[2];
            swapPsbt.addInput({
                hash: takerInput.hash.toString('hex'),
                index: 0,
                witnessUtxo: {
                    value: 546,
                    script: (_a = takerInputData === null || takerInputData === void 0 ? void 0 : takerInputData.witnessUtxo) === null || _a === void 0 ? void 0 : _a.script,
                },
                tapInternalKey: takerInputData.tapInternalKey,
                tapKeySig: takerInputData.tapKeySig,
                sighashType: bitcoin.Transaction.SIGHASH_SINGLE |
                    bitcoin.Transaction.SIGHASH_ANYONECANPAY,
            });
            for (let i = 0; i < retrievedUtxos.length; i++) {
                swapPsbt.addInput({
                    hash: retrievedUtxos[i].tx_hash_big_endian,
                    index: retrievedUtxos[i].tx_output_n,
                    witnessUtxo: {
                        value: retrievedUtxos[i].value,
                        script: Buffer.from(retrievedUtxos[0].script, 'hex'),
                    },
                    tapInternalKey: (0, utils_1.assertHex)(Buffer.from(this.pubKey, 'hex')),
                });
            }
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: 1200,
            });
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: 546,
            });
            swapPsbt.addOutput({
                address: this.makersAddress,
                value: costPrice,
            });
            const amountRetrieved = this.calculateAmountGathered(retrievedUtxos);
            const remainder = amountRetrieved - costPrice - 30000 - 546 - 1200;
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: 600,
            });
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: 600,
            });
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: remainder,
            });
        });
    }
    getAllUTXOsWorthASpecificValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const unspents = yield this.getUnspentsWithConfirmationsForAddress();
            return unspents.filter((utxo) => utxo.value === value);
        });
    }
    calculateAmountGathered(utxoArray) {
        return utxoArray === null || utxoArray === void 0 ? void 0 : utxoArray.reduce((prev, currentValue) => prev + currentValue.value, 0);
    }
    getUnspentsWithConfirmationsForAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.esploraRpc.getAddressUtxo(this.walletAddress).then((unspents) => unspents === null || unspents === void 0 ? void 0 : unspents.filter((utxo) => utxo.confirmations >= 0));
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getUnspentsForAddressInOrderByValue() {
        return __awaiter(this, void 0, void 0, function* () {
            const unspents = yield this.getUnspentsWithConfirmationsForAddress();
            return unspents.sort((a, b) => b.value - a.value);
        });
    }
    getMakersAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const swapTx = yield this.sandshrewBtcClient.bitcoindRpc.decodePSBT(this.psbtBase64);
            const outputs = swapTx.tx.vout;
            for (var i = 0; i < outputs.length; i++) {
                if (outputs[i].value == this.orderPrice) {
                    this.makersAddress = outputs[i].scriptPubKey.address;
                }
            }
        });
    }
}
exports.BuildMarketplaceTransaction = BuildMarketplaceTransaction;
//# sourceMappingURL=buildMarketplaceTransaction.js.map