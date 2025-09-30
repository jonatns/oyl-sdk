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
        if (input.witnessUtxo) {
            const scriptLen = input.witnessUtxo.script.length;
            if (scriptLen === 34) { // P2TR
                if (input.tapLeafScript && input.tapLeafScript.length > 0) {
                    // Script-path spend (e.g., inscription reveal)
                    const leafScript = input.tapLeafScript[0];
                    const witness = [
                        Buffer.alloc(64),
                        leafScript.script,
                        leafScript.controlBlock,
                    ];
                    tx.setWitness(index, witness);
                }
                else {
                    // Key-path spend
                    tx.setWitness(index, [Buffer.alloc(65)]); // schnorr signature
                }
            }
            else if (scriptLen === 22) { // P2WPKH
                tx.setWitness(index, [Buffer.alloc(107)]);
            }
        }
        else if (input.tapInternalKey) {
            // Fallback for key-path spend if witnessUtxo is not present
            tx.setWitness(index, [Buffer.alloc(65)]);
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