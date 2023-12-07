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
exports.PSBTTransaction = void 0;
const constants_1 = require("../shared/constants");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utils_1 = require("../shared/utils");
const interface_1 = require("../shared/interface");
class PSBTTransaction {
    /**
     * Creates an instance of PSBTTransaction.
     * @param signer - Signer method bound to the HdKeyring.
     * @param address - Address associated with the transaction.
     * @param pubkey - Public key for the transaction.
     * @param feeRate - The fee rate in satoshis per byte.
     */
    constructor(signer, address, publicKey, feeRate, segwitSigner, segwitPubKey) {
        this.inputs = [];
        this.outputs = [];
        this.changeOutputIndex = -1;
        this.network = bitcoin.networks.bitcoin;
        this.enableRBF = false;
        /**
         * Formats the inputs for signing based on the given PSBT and whether it is a reveal transaction.
         * @param { bitcoin.Psbt} psbt |  - The PSBT in hex string format or Psbt instance.
         * @returns {Promise<ToSignInput[]>} A promise that resolves to an array of inputs to sign.
         */
        this.formatOptionsToSignInputs = (psbt) => __awaiter(this, void 0, void 0, function* () {
            let toSignInputs = [];
            const psbtNetwork = bitcoin.networks.bitcoin;
            psbt.data.inputs.forEach((v, index) => {
                var _a, _b;
                console.log({ v });
                console.log({ inputScript: v });
                let script = null;
                let value = 0;
                const isSigned = v.finalScriptSig || v.finalScriptWitness;
                const lostInternalPubkey = !v.tapInternalKey;
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
                if (!isSigned && lostInternalPubkey) {
                    const tapInternalKey = (0, utils_1.assertHex)(Buffer.from(this.pubkey, 'hex'));
                    const p2tr = bitcoin.payments.p2tr({
                        internalPubkey: tapInternalKey,
                        network: psbtNetwork,
                    });
                    const isSameScript = ((_a = v.witnessUtxo) === null || _a === void 0 ? void 0 : _a.script.toString('hex')) == ((_b = p2tr.output) === null || _b === void 0 ? void 0 : _b.toString('hex'));
                    if (isSameScript) {
                        v.tapInternalKey = tapInternalKey;
                    }
                }
                toSignInputs.push({
                    index: index,
                    publicKey: this.pubkey,
                    sighashTypes: v.sighashType ? [v.sighashType] : undefined,
                });
            });
            return { psbt, toSignInputs };
        });
        this.signer = signer;
        this.address = address;
        this.pubkey = publicKey;
        this.feeRate = feeRate || 5;
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
    signInputs(psbt, toSignInputs) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const taprootInputs = [];
                const segwitInputs = [];
                toSignInputs.forEach(({ index, publicKey }) => {
                    console.log({ publicKey });
                    if (publicKey.slice(0, 2) === '02') {
                        taprootInputs.push(toSignInputs[index]);
                    }
                    if (publicKey.slice(0, 2) === '03') {
                        segwitInputs.push(toSignInputs[index]);
                    }
                });
                if (segwitInputs.length > 0) {
                    yield this.signer(psbt, segwitInputs);
                }
                else if (taprootInputs.length > 0) {
                    yield this.signer(psbt, taprootInputs);
                }
                else {
                    console.error('NO INPUTS!');
                }
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    /**
     * Creates a signed PSBT for the transaction.
     * @returns {Promise<bitcoin.Psbt>} A promise that resolves to the signed PSBT instance.
     */
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
    /**
     * Signs the provided PSBT with the available keys.
     * @param {bitcoin.Psbt} psbt - The PSBT to sign.
     * @returns {Promise<bitcoin.Psbt>} A promise that resolves to the signed PSBT.
     */
    signPsbt(psbt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { psbt: formattedPsbt, toSignInputs, } = yield this.formatOptionsToSignInputs(psbt);
                yield this.signInputs(formattedPsbt, toSignInputs);
                return formattedPsbt;
            }
            catch (e) {
                console.log(e);
            }
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
exports.PSBTTransaction = PSBTTransaction;
//# sourceMappingURL=PSBTTransaction.js.map