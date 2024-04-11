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
const utils_1 = require("../shared/utils");
const transactions_1 = require("../transactions");
const interface_1 = require("../shared/interface");
const bitcoin = __importStar(require("bitcoinjs-lib"));
class BuildMarketplaceTransaction {
    constructor({ address, pubKey, receiveAddress, psbtBase64, price, wallet, }) {
        var _a, _b;
        this.walletAddress = address;
        this.pubKey = pubKey;
        this.receiveAddress = receiveAddress;
        this.api = wallet.apiClient;
        this.esplora = wallet.esploraRpc;
        this.sandshrew = wallet.sandshrewBtcClient;
        this.psbtBase64 = psbtBase64;
        this.orderPrice = price;
        this.network = wallet.network;
        this.addressType = (0, transactions_1.getAddressType)(this.walletAddress);
        switch (this.addressType) {
            case interface_1.AddressType.P2TR: {
                const tapInternalKey = (0, utils_1.assertHex)(Buffer.from(this.pubKey, 'hex'));
                const p2tr = bitcoin.payments.p2tr({
                    internalPubkey: tapInternalKey,
                    network: this.network,
                });
                this.takerScript = (_a = p2tr.output) === null || _a === void 0 ? void 0 : _a.toString('hex');
                break;
            }
            case interface_1.AddressType.P2WPKH: {
                const p2wpkh = bitcoin.payments.p2wpkh({
                    pubkey: Buffer.from(this.pubKey, 'hex'),
                    network: this.network,
                });
                this.takerScript = (_b = p2wpkh.output) === null || _b === void 0 ? void 0 : _b.toString('hex');
                break;
            }
        }
    }
    getUTXOsToCoverAmount(amountNeeded, inscriptionLocs) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('=========== Getting Unspents for address in order by value ========');
                const unspentsOrderedByValue = yield this.getUnspentsForAddressInOrderByValue();
                console.log('unspentsOrderedByValue len:', unspentsOrderedByValue.length);
                console.log('=========== Getting Collectibles for address ' +
                    this.walletAddress +
                    '========');
                const retrievedIxs = (yield this.api.getCollectiblesByAddress(this.walletAddress)).data;
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
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    isWalletPrepared() {
        return __awaiter(this, void 0, void 0, function* () {
            const allUtxosWorth600 = yield this.getAllUTXOsWorthASpecificValue(600);
            if (allUtxosWorth600.length < 2) {
                return false;
            }
            return true;
        });
    }
    prepareWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            const requiredSatoshis = 10000 + 1200;
            const retrievedUtxos = yield this.getUTXOsToCoverAmount(requiredSatoshis);
            if (retrievedUtxos.length === 0) {
                throw Error('Not enough funds to prepare address utxos');
            }
            const prepareTx = new bitcoin.Psbt({ network: this.network });
            console.log('=========== Retreived Utxos to add: ', retrievedUtxos);
            retrievedUtxos.forEach((utxo) => {
                const input = this.addInputConditionally({
                    hash: utxo.txid,
                    index: utxo.vout,
                    witnessUtxo: {
                        value: utxo.value,
                        script: Buffer.from(this.takerScript, 'hex'),
                    },
                });
                prepareTx.addInput(input);
            });
            const amountRetrieved = this.calculateAmountGathered(retrievedUtxos);
            const remainder = amountRetrieved - 30000 - 1200;
            prepareTx.addOutput({
                address: this.walletAddress,
                value: 600,
            });
            prepareTx.addOutput({
                address: this.walletAddress,
                value: 600,
            });
            prepareTx.addOutput({
                address: this.walletAddress,
                value: remainder,
            });
            return {
                psbtHex: prepareTx.toHex(),
                psbtBase64: prepareTx.toBase64(),
                remainder,
            };
        });
    }
    checkAffordability(costEstimate) {
        return __awaiter(this, void 0, void 0, function* () {
            const retrievedUtxos = yield this.getUTXOsToCoverAmount(costEstimate);
            if (retrievedUtxos.length === 0) {
                return false;
            }
            return true;
        });
    }
    psbtBuilder() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('=========== Decoding PSBT with bitcoinjs ========');
            const marketplacePsbt = bitcoin.Psbt.fromBase64(this.psbtBase64, {
                network: this.network,
            });
            const costPrice = this.orderPrice;
            const requiredSatoshis = costPrice + 30000 + 546 + 1200 + 600 + 600;
            const retrievedUtxos = yield this.getUTXOsToCoverAmount(requiredSatoshis);
            if (retrievedUtxos.length === 0) {
                throw Error('Not enough funds to purchase this offer');
            }
            console.log('=========== Getting UTXOS Worth 600 sats ========');
            const allUtxosWorth600 = yield this.getAllUTXOsWorthASpecificValue(600);
            console.log('=========== UTXOs worth 600 sats: ', allUtxosWorth600);
            if (allUtxosWorth600.length < 2) {
                throw Error('not enough padding utxos (600 sat) for marketplace buy');
            }
            console.log("=========== Getting Maker's Address ========");
            yield this.getMakersAddress();
            console.log('=========== Makers Address: ', this.makersAddress);
            if (!this.makersAddress) {
                throw Error("Could not resolve maker's address");
            }
            console.log('=========== Creating Inputs ========');
            const swapPsbt = new bitcoin.Psbt({ network: this.network });
            console.log('=========== Adding dummy utxos ========');
            for (let i = 0; i < 2; i++) {
                const input = this.addInputConditionally({
                    hash: allUtxosWorth600[i].txid,
                    index: allUtxosWorth600[i].vout,
                    witnessUtxo: {
                        value: allUtxosWorth600[i].value,
                        script: Buffer.from(this.takerScript, 'hex'),
                    },
                });
                swapPsbt.addInput(input);
            }
            console.log('=========== Fetching Maker Input Data ========');
            const decoded = yield this.sandshrew.bitcoindRpc.decodePSBT(this.psbtBase64);
            console.log('maker offer txid', decoded.tx.vin[2].txid);
            const makerInputData = marketplacePsbt.data.inputs[2];
            console.log('=========== Maker Input Data: ', makerInputData);
            swapPsbt.addInput({
                hash: decoded.tx.vin[2].txid,
                index: 0,
                witnessUtxo: {
                    value: (_a = makerInputData === null || makerInputData === void 0 ? void 0 : makerInputData.witnessUtxo) === null || _a === void 0 ? void 0 : _a.value,
                    script: (_b = makerInputData === null || makerInputData === void 0 ? void 0 : makerInputData.witnessUtxo) === null || _b === void 0 ? void 0 : _b.script,
                },
                // tapInternalKey: makerInputData.tapInternalKey,
                // tapKeySig: makerInputData.tapKeySig,
                finalScriptWitness: makerInputData.finalScriptWitness,
                sighashType: bitcoin.Transaction.SIGHASH_SINGLE |
                    bitcoin.Transaction.SIGHASH_ANYONECANPAY,
            });
            console.log('=========== Adding available non ordinal UTXOS as input ========');
            console.log('=========== Retreived Utxos to add: ', retrievedUtxos);
            retrievedUtxos.forEach((utxo) => {
                const input = this.addInputConditionally({
                    hash: utxo.txid,
                    index: utxo.vout,
                    witnessUtxo: {
                        value: utxo.value,
                        script: Buffer.from(this.takerScript, 'hex'),
                    },
                });
                swapPsbt.addInput(input);
            });
            console.log('=========== Done Inputs now adding outputs ============');
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: 1200,
            });
            swapPsbt.addOutput({
                address: this.receiveAddress,
                value: 546,
            });
            swapPsbt.addOutput({
                address: this.makersAddress,
                value: costPrice,
            });
            const amountRetrieved = this.calculateAmountGathered(retrievedUtxos);
            const remainder = amountRetrieved - costPrice - 30000 - 546 - 1200 - 600 - 600;
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
            console.log('=========== Returning unsigned PSBT ============');
            return {
                psbtHex: swapPsbt.toHex(),
                psbtBase64: swapPsbt.toBase64(),
                remainder,
            };
        });
    }
    psbtMultiBuilder(previousOrderTxId, remainingSats) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const requiredSatoshis = this.orderPrice + 30000 + 546 + 1200;
            if (!(remainingSats > requiredSatoshis)) {
                throw new Error('Not enough satoshi to complete purchase');
            }
            const marketplacePsbt = bitcoin.Psbt.fromBase64(this.psbtBase64, {
                network: this.network,
            });
            const swapPsbt = new bitcoin.Psbt({ network: this.network });
            swapPsbt.addInput(this.addInputConditionally({
                hash: previousOrderTxId,
                index: 3,
                witnessUtxo: {
                    value: 600,
                    script: Buffer.from(this.takerScript, 'hex'),
                },
            }));
            swapPsbt.addInput(this.addInputConditionally({
                hash: previousOrderTxId,
                index: 4,
                witnessUtxo: {
                    value: 600,
                    script: Buffer.from(this.takerScript, 'hex'),
                },
            }));
            console.log("=========== Getting Maker's Address ========");
            yield this.getMakersAddress();
            console.log('=========== Makers Address: ', this.makersAddress);
            if (!this.makersAddress) {
                throw Error("Could not resolve maker's address");
            }
            const decoded = yield this.sandshrew.bitcoindRpc.decodePSBT(this.psbtBase64);
            const makerInputData = marketplacePsbt.data.inputs[2];
            const neededSats = marketplacePsbt.txOutputs[2].value;
            swapPsbt.addInput({
                hash: decoded.tx.vin[2].txid,
                index: 0,
                witnessUtxo: {
                    value: (_a = makerInputData === null || makerInputData === void 0 ? void 0 : makerInputData.witnessUtxo) === null || _a === void 0 ? void 0 : _a.value,
                    script: (_b = makerInputData === null || makerInputData === void 0 ? void 0 : makerInputData.witnessUtxo) === null || _b === void 0 ? void 0 : _b.script,
                },
                // tapInternalKey: makerInputData.tapInternalKey,
                // tapKeySig: makerInputData.tapKeySig,
                finalScriptWitness: makerInputData.finalScriptWitness,
                sighashType: bitcoin.Transaction.SIGHASH_SINGLE |
                    bitcoin.Transaction.SIGHASH_ANYONECANPAY,
            });
            swapPsbt.addInput(this.addInputConditionally({
                hash: previousOrderTxId,
                index: 5,
                witnessUtxo: {
                    value: remainingSats,
                    script: Buffer.from(this.takerScript, 'hex'),
                },
                tapInternalKey: (0, utils_1.assertHex)(Buffer.from(this.pubKey, 'hex')),
            }));
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: 1200,
            });
            swapPsbt.addOutput({
                address: this.receiveAddress,
                value: 546,
            });
            swapPsbt.addOutput({
                address: this.makersAddress,
                value: neededSats,
            });
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: 600,
            });
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: 600,
            });
            const remainder = remainingSats - neededSats - 30000 - 546 - 1200;
            swapPsbt.addOutput({
                address: this.walletAddress,
                value: remainder,
            });
            return {
                psbtHex: swapPsbt.toHex(),
                psbtBase64: swapPsbt.toBase64(),
                remainingSats: remainder,
            };
        });
    }
    getAllUTXOsWorthASpecificValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const unspents = yield this.getUnspentsForAddress();
            console.log('=========== Confirmed/Unconfirmed Utxos Len', unspents.length);
            return unspents.filter((utxo) => utxo.value === value);
        });
    }
    calculateAmountGathered(utxoArray) {
        return utxoArray === null || utxoArray === void 0 ? void 0 : utxoArray.reduce((prev, currentValue) => prev + currentValue.value, 0);
    }
    getUnspentsForAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                '=========== Getting all confirmed/unconfirmed utxos for ' +
                    this.walletAddress +
                    ' ============';
                return yield this.esplora
                    .getAddressUtxo(this.walletAddress)
                    .then((unspents) => unspents === null || unspents === void 0 ? void 0 : unspents.filter((utxo) => utxo.value > 546));
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getUnspentsForAddressInOrderByValue() {
        return __awaiter(this, void 0, void 0, function* () {
            const unspents = yield this.getUnspentsForAddress();
            console.log('=========== Confirmed Utxos len', unspents.length);
            return unspents.sort((a, b) => b.value - a.value);
        });
    }
    getMakersAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const swapTx = yield this.sandshrew.bitcoindRpc.decodePSBT(this.psbtBase64);
            const outputs = swapTx.tx.vout;
            console.log('outputs', outputs);
            this.makersAddress = outputs[2].scriptPubKey.address;
            // for (var i = 0; i < outputs.length; i++) {
            //   if (outputs[i].value == this.orderPrice / 100000000) {
            //     this.makersAddress = outputs[i].scriptPubKey.address
            //   }
            // }
        });
    }
    addInputConditionally(inputData) {
        if (this.addressType === interface_1.AddressType.P2TR) {
            inputData['tapInternalKey'] = (0, utils_1.assertHex)(Buffer.from(this.pubKey, 'hex'));
        }
        return inputData;
    }
    ;
}
exports.BuildMarketplaceTransaction = BuildMarketplaceTransaction;
//# sourceMappingURL=buildMarketplaceTx.js.map