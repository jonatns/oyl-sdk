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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PSBTTransaction = exports.utxoToInput = void 0;
const constants_1 = require("../shared/constants");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utils_1 = require("../shared/utils");
const interface_1 = require("../shared/interface");
const ecpair_1 = __importDefault(require("ecpair"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
bitcoin.initEccLib(secp256k1_1.default);
const ECPair = (0, ecpair_1.default)(secp256k1_1.default);
function utxoToInput(utxo, publicKey) {
    if (utxo.addressType === interface_1.AddressType.P2TR) {
        const data = {
            hash: utxo.txId,
            index: utxo.outputIndex,
            witnessUtxo: {
                value: utxo.satoshis,
                script: Buffer.from(utxo.scriptPk, "hex"),
            },
            tapInternalKey: (0, utils_1.toXOnly)(publicKey),
        };
        return {
            data,
            utxo,
        };
    }
    else if (utxo.addressType === interface_1.AddressType.P2WPKH) {
        const data = {
            hash: utxo.txId,
            index: utxo.outputIndex,
            witnessUtxo: {
                value: utxo.satoshis,
                script: Buffer.from(utxo.scriptPk, "hex"),
            },
        };
        return {
            data,
            utxo,
        };
    }
    else if (utxo.addressType === interface_1.AddressType.P2PKH) {
        const data = {
            hash: utxo.txId,
            index: utxo.outputIndex,
            witnessUtxo: {
                value: utxo.satoshis,
                script: Buffer.from(utxo.scriptPk, "hex"),
            },
        };
        return {
            data,
            utxo,
        };
    }
    else if (utxo.addressType === interface_1.AddressType.P2SH_P2WPKH) {
        const redeemData = bitcoin.payments.p2wpkh({ pubkey: publicKey });
        const data = {
            hash: utxo.txId,
            index: utxo.outputIndex,
            witnessUtxo: {
                value: utxo.satoshis,
                script: Buffer.from(utxo.scriptPk, "hex"),
            },
            redeemScript: redeemData.output,
        };
        return {
            data,
            utxo,
        };
    }
    const data = {
        hash: "",
        index: 0,
        witnessUtxo: {
            value: 0,
            script: Buffer.from(utxo.scriptPk, "hex"),
        }
    };
    return {
        data,
        utxo
    };
}
exports.utxoToInput = utxoToInput;
class PSBTTransaction {
    constructor(signer, address, pubkey, addressType, feeRate) {
        this.inputs = [];
        this.outputs = [];
        this.changeOutputIndex = -1;
        this.network = bitcoin.networks.bitcoin;
        this.enableRBF = true;
        this.signer = signer;
        this.address = address;
        this.pubkey = pubkey;
        this.addressType = addressType;
        this.feeRate = feeRate || 5;
    }
    setEnableRBF(enable) {
        this.enableRBF = enable;
    }
    setChangeAddress(address) {
        this.changedAddress = address;
    }
    addInput(utxo) {
        this.inputs.push(utxoToInput(utxo, Buffer.from(this.pubkey, "hex")));
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
    signPsbt(psbt, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const psbtNetwork = bitcoin.networks.bitcoin;
            const toSignInputs = [];
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
                    if (this.address === address) {
                        toSignInputs.push({
                            index,
                            publicKey: this.pubkey,
                            sighashTypes: v.sighashType ? [v.sighashType] : undefined
                        });
                        if (this.addressType === interface_1.AddressType.P2TR && !v.tapInternalKey) {
                            v.tapInternalKey = (0, utils_1.toXOnly)(Buffer.from(this.pubkey, 'hex'));
                        }
                    }
                }
            });
            psbt = yield this.signer(psbt, toSignInputs);
            toSignInputs.forEach((v) => {
                // psbt.validateSignaturesOfInput(v.index, validator);
                psbt.finalizeInput(v.index);
            });
            return psbt;
        });
    }
    ;
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
                .join("")}
total: ${this.getTotalInput()} Sats
----------------------------------------------------------------------------------------------
Outputs
${this.outputs
                .map((output, index) => {
                const str = `
=>${index} ${output.address} ${output.value} Sats`;
                return str;
            })
                .join("")}

total: ${this.getTotalOutput() - feePaid} Sats
=============================================================================================
    `);
        });
    }
}
exports.PSBTTransaction = PSBTTransaction;
//# sourceMappingURL=PSBTTransaction.js.map