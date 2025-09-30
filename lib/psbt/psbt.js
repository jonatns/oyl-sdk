"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstimatedFee = exports.psbtBuilder = void 0;
const tslib_1 = require("tslib");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const psbtBuilder = async (psbtBuilder, params) => {
    const { psbt } = await psbtBuilder(params);
    const { fee: actualFee } = await (0, exports.getEstimatedFee)({
        feeRate: params.feeRate,
        psbt,
        provider: params.provider
    });
    const { psbt: finalPsbt } = await psbtBuilder({
        ...params,
        fee: actualFee
    });
    const { fee: finalFee, vsize } = await (0, exports.getEstimatedFee)({
        feeRate: params.feeRate,
        psbt: finalPsbt,
        provider: params.provider,
    });
    return { psbt: finalPsbt, fee: finalFee, vsize };
};
exports.psbtBuilder = psbtBuilder;
const getEstimatedFee = async ({ feeRate, psbt, provider, }) => {
    const psbtObj = bitcoin.Psbt.fromBase64(psbt, { network: provider.network });
    const tx = new bitcoin.Transaction();
    psbtObj.txInputs.forEach(input => {
        tx.addInput(input.hash, input.index);
    });
    psbtObj.txOutputs.forEach(output => {
        tx.addOutput(output.script, output.value);
    });
    psbtObj.data.inputs.forEach((input, index) => {
        if (input.tapInternalKey) {
            tx.setWitness(index, [Buffer.alloc(65)]);
        }
        else if (input.witnessUtxo) {
            tx.setWitness(index, [Buffer.alloc(107)]);
        }
    });
    const vsize = tx.virtualSize();
    const fee = Math.ceil(vsize * feeRate);
    console.log("getEstimatedFee vsize ", vsize);
    return {
        fee,
        vsize,
    };
};
exports.getEstimatedFee = getEstimatedFee;
//# sourceMappingURL=psbt.js.map