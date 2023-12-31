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
exports.OGPSBTTransaction = void 0;
const constants_1 = require("../shared/constants");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utils_1 = require("../shared/utils");
const interface_1 = require("../shared/interface");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
class OGPSBTTransaction {

    constructor(signer, address, pubkey, addressType, network, feeRate) {

        this.inputs = [];
        this.outputs = [];
        this.changeOutputIndex = -1;
        this.enableRBF = true;
        this.formatOptionsToSignInputs = (_psbt, isRevealTx = false) => __awaiter(this, void 0, void 0, function* () {
            let toSignInputs = [];
            const psbtNetwork = this.network;
            const psbt = typeof _psbt === 'string'
                ? bitcoin.Psbt.fromHex(_psbt, { network: psbtNetwork })
                : _psbt;
            psbt.data.inputs.forEach((v, index) => {
                let script = null;
                let value = 0;
                if (v.witnessUtxo) {
                    script = v.witnessUtxo.script;
                    value = v.witnessUtxo.value;
                }
                else if (v.nonWitnessUtxo) {
                    const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
                    const output = tx.outs[psbt.txInputs[index].index];
                    script = output.script;
                    value = output.value;
                }
                const isSigned = v.finalScriptSig || v.finalScriptWitness;
                if (script && !isSigned) {
                    const address = bitcoinjs_lib_1.address.fromOutputScript(script, psbtNetwork);
                    if (isRevealTx || (!isRevealTx && this.address === address)) {
                        toSignInputs.push({
                            index,
                            publicKey: this.pubkey,
                            sighashTypes: v.sighashType ? [v.sighashType] : undefined,
                        });
                    }
                }
            });
            console.log('toSignInputs', toSignInputs);
            return toSignInputs;
        });
        this.signer = signer;
        this.address = address;
        this.pubkey = pubkey;
        this.addressType = addressType;
        this.feeRate = feeRate || 5;
        this.network = network;
    }
    setEnableRBF(enable) {
        this.enableRBF = enable;
    }
    setChangeAddress(address) {
        this.changedAddress = address;
    }
    addInput(utxo) {
        this.inputs.push((0, utils_1.utxoToInput)(utxo, Buffer.from(this.pubkey, 'hex')));
    }
    getTotalInput() {
        return this.inputs.reduce((pre, cur) => pre + cur.data.witnessUtxo.value, 0);
    }
    getTotalOutput() {
        return this.outputs.reduce((pre, cur) => pre + cur.value, 0);
    }
    getUnspent() {
        return this.getTotalInput() - this.getTotalOutput();
    }
    isEnoughFee() {
        return __awaiter(this, void 0, void 0, function* () {
            const psbt1 = yield this.createSignedPsbt();
            if (psbt1.getFeeRate() >= this.feeRate) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    calNetworkFee() {
        return __awaiter(this, void 0, void 0, function* () {
            const psbt = yield this.createSignedPsbt();
            let txSize = psbt.extractTransaction(true).toBuffer().length;
            psbt.data.inputs.forEach((v) => {
                if (v.finalScriptWitness) {
                    txSize -= v.finalScriptWitness.length * 0.75;
                }
            });
            const fee = Math.ceil(txSize * this.feeRate);
            return fee;
        });
    }
    addOutput(address, value) {
        this.outputs.push({
            address,
            value,
        });
    }
    getOutput(index) {
        return this.outputs[index];
    }
    addChangeOutput(value) {
        this.outputs.push({
            address: this.changedAddress,
            value,
        });
        this.changeOutputIndex = this.outputs.length - 1;
    }
    getChangeOutput() {
        return this.outputs[this.changeOutputIndex];
    }
    getChangeAmount() {
        const output = this.getChangeOutput();
        return output ? output.value : 0;
    }
    removeChangeOutput() {
        this.outputs.splice(this.changeOutputIndex, 1);
        this.changeOutputIndex = -1;
    }
    removeRecentOutputs(count) {
        this.outputs.splice(-count);
    }
    createSignedPsbt() {
        return __awaiter(this, void 0, void 0, function* () {
            const psbt = new bitcoin.Psbt({ network: this.network });
            this.inputs.forEach((v, index) => {
                if (v.utxo.addressType === interface_1.AddressType.P2PKH) {
                    //@ts-ignore
                    psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = true;
                }
                psbt.addInput(v.data);
                if (this.enableRBF) {
                    psbt.setInputSequence(index, 0xfffffffd); // support RBF
                }
            });
            this.outputs.forEach((v) => {
                psbt.addOutput(v);
            });
            yield this.signPsbt(psbt);
            return psbt;
        });
    }
    signPsbt(psbt, autoFinalized = true, isRevealTx = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const psbtNetwork = this.network;
            const toSignInputs = yield this.formatOptionsToSignInputs(psbt, isRevealTx);
            psbt.data.inputs.forEach((v, index) => {
                var _a;
                const isNotSigned = !(v.finalScriptSig || v.finalScriptWitness);
                const isP2TR = this.addressType === interface_1.AddressType.P2TR;
                const lostInternalPubkey = !v.tapInternalKey;
                if (isNotSigned && isP2TR && lostInternalPubkey) {
                    const tapInternalKey = (0, utils_1.assertHex)(Buffer.from(this.pubkey, 'hex'));
                    const { output } = bitcoin.payments.p2tr({
                        internalPubkey: tapInternalKey,
                        network: psbtNetwork,
                    });
                    if (((_a = v.witnessUtxo) === null || _a === void 0 ? void 0 : _a.script.toString('hex')) == (output === null || output === void 0 ? void 0 : output.toString('hex'))) {
                        v.tapInternalKey = tapInternalKey;
                    }
                }
            });
            psbt = yield this.signer(psbt, toSignInputs);
            if (autoFinalized) {
                console.log('autoFinalized');
                toSignInputs.forEach((v) => {
                    psbt.finalizeInput(v.index);
                });
            }
            return psbt;
        });
    }
    generate(autoAdjust) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try to estimate fee
            const unspent = this.getUnspent();
            this.addChangeOutput(Math.max(unspent, 0));
            const psbt1 = yield this.createSignedPsbt();
            // this.dumpTx(psbt1);
            this.removeChangeOutput();
            // todo: support changing the feeRate
            const txSize = psbt1.extractTransaction().toBuffer().length;
            const fee = txSize * this.feeRate;
            if (unspent > fee) {
                const left = unspent - fee;
                if (left > constants_1.UTXO_DUST) {
                    this.addChangeOutput(left);
                }
            }
            else {
                if (autoAdjust) {
                    this.outputs[0].value -= fee - unspent;
                }
            }
            const psbt2 = yield this.createSignedPsbt();
            const tx = psbt2.extractTransaction();
            const rawtx = tx.toHex();
            const toAmount = this.outputs[0].value;
            return {
                fee: psbt2.getFee(),
                rawtx,
                toSatoshis: toAmount,
                estimateFee: fee,
            };
        });
    }
    dumpTx(psbt) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = psbt.extractTransaction();
            const size = tx.toBuffer().length;
            const feePaid = psbt.getFee();
            const feeRate = (feePaid / size).toFixed(4);
            console.log(`
=============================================================================================
Summary
  txid:     ${tx.getId()}
  Size:     ${tx.byteLength()}
  Fee Paid: ${psbt.getFee()}
  Fee Rate: ${feeRate} sat/B
  Detail:   ${psbt.txInputs.length} Inputs, ${psbt.txOutputs.length} Outputs
----------------------------------------------------------------------------------------------
Inputs
${this.inputs
                .map((input, index) => {
                const str = `
=>${index} ${input.data.witnessUtxo.value} Sats
        lock-size: ${input.data.witnessUtxo.script.length}
        via ${input.data.hash} [${input.data.index}]
`;
                return str;
            })
                .join('')}
total: ${this.getTotalInput()} Sats
----------------------------------------------------------------------------------------------
Outputs
${this.outputs
                .map((output, index) => {
                const str = `
=>${index} ${output.address} ${output.value} Sats`;
                return str;
            })
                .join('')}

total: ${this.getTotalOutput() - feePaid} Sats
=============================================================================================
    `);
        });
    }
}
exports.OGPSBTTransaction = OGPSBTTransaction;
//# sourceMappingURL=OGPSBTTransaction.js.map