"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const constants_1 = require("../shared/constants");
const ordit_sdk_1 = require("@sadoprotocol/ordit-sdk");
const utils_1 = require("../shared/utils");
class FeeEstimator {
    fee = 0;
    feeRate;
    network;
    psbt;
    witness = [];
    virtualSize = 0;
    weight = 0;
    constructor({ feeRate, network, psbt, witness }) {
        if (feeRate < 0 || !Number.isSafeInteger(feeRate)) {
            throw new Error("Invalid feeRate");
        }
        this.feeRate = +feeRate; // convert decimal to whole number that might have passed Number.isSafeInteger check due to precision loss
        this.network = network;
        this.witness = witness || [];
        this.psbt = psbt || new bitcoinjs_lib_1.Psbt({ network: (0, utils_1.getNetwork)(this.network) });
    }
    get data() {
        return {
            fee: this.fee,
            virtualSize: this.virtualSize,
            weight: this.weight
        };
    }
    sanityCheckFee() {
        if (this.fee > constants_1.MAXIMUM_FEE) {
            throw new Error("Error while calculating fees");
        }
    }
    calculateNetworkFee() {
        this.fee = this.calculateVirtualSize() * this.feeRate;
        this.sanityCheckFee();
        return this.fee;
    }
    analyzePSBTComponents() {
        const inputs = this.psbt.data.inputs;
        const outputs = this.psbt.txOutputs;
        const inputTypes = [];
        const outputTypes = [];
        if (inputs.length === 0) {
            throw new Error("PSBT must have at least one input");
        }
        if (outputs.length === 0) {
            throw new Error("PSBT must have at least one output");
        }
        inputs.forEach((input) => {
            const script = input.witnessUtxo && input.witnessUtxo.script ? input.witnessUtxo.script : null;
            if (!script) {
                throw new Error("Invalid script");
            }
            inputTypes.push((0, ordit_sdk_1.getScriptType)(script, this.network).format);
        });
        outputs.forEach((output) => {
            outputTypes.push((0, ordit_sdk_1.getScriptType)(output.script, this.network).format);
        });
        return {
            inputTypes,
            outputTypes
        };
    }
    calculateScriptWitnessSize() {
        return this.analyzePSBTComponents().inputTypes.includes("taproot") && this.witness?.length
            ? this.witness.reduce((acc, witness) => (acc += witness.byteLength), 0) || 0
            : 0;
    }
    getBaseSize() {
        const { inputTypes, outputTypes } = this.analyzePSBTComponents();
        const witnessHeaderSize = 2;
        const inputVBytes = inputTypes.reduce((acc, inputType) => {
            const { input, txHeader, witness } = this.getBaseSizeByType(inputType);
            acc.txHeader = txHeader;
            acc.input += input;
            acc.witness += witness;
            return acc;
        }, {
            input: 0,
            witness: 0,
            txHeader: 0
        });
        const outputVBytes = outputTypes.reduce((acc, outputType) => {
            const { output } = this.getBaseSizeByType(outputType);
            acc += output;
            return acc;
        }, 0);
        const witnessSize = inputVBytes.witness + (this.witness?.length ? this.calculateScriptWitnessSize() : 0);
        return {
            baseSize: inputVBytes.input + inputVBytes.txHeader + outputVBytes,
            witnessSize: this.witness?.length ? witnessSize : witnessSize > 0 ? witnessHeaderSize + witnessSize : 0
        };
    }
    calculateVirtualSize() {
        const { baseSize, witnessSize } = this.getBaseSize();
        this.weight = baseSize * 3 + (baseSize + witnessSize);
        this.virtualSize = Math.ceil(this.weight / 4);
        return this.virtualSize;
    }
    getBaseSizeByType(type) {
        switch (type) {
            case "taproot":
                return { input: 42, output: 43, txHeader: 10.5, witness: 66 }; // witness size is different for non-default sigHash
            case "segwit":
                return { input: 41, output: 31, txHeader: 10.5, witness: 105 };
            case "nested-segwit":
                return { input: 64, output: 32, txHeader: 10, witness: 105 };
            case "legacy":
                return { input: 148, output: 34, txHeader: 10, witness: 0 };
            default:
                throw new Error("Invalid type");
        }
    }
}
exports.default = FeeEstimator;
//# sourceMappingURL=feeEstimator.js.map