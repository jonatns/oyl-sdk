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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrdTx = void 0;
function buildOrdTx({ psbtTx, allUtxos, toAddress, metaOutputValue, feeRate, inscriptionId, taprootAddress, payFeesWithSegwit, segwitAddress, segwitUtxos, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { metaUtxos, nonMetaUtxos } = allUtxos.reduce((acc, utxo) => {
            utxo.inscriptions.length
                ? acc.metaUtxos.push(utxo)
                : acc.nonMetaUtxos.push(utxo);
            return acc;
        }, { metaUtxos: [], nonMetaUtxos: [] });
        yield addInscriptionUtxo({
            metaUtxos: metaUtxos,
            inscriptionId: inscriptionId,
            toAddress: toAddress,
            psbtTx: psbtTx,
        });
        psbtTx.outputs[0].value = metaOutputValue;
        yield getUtxosForFees({
            payFeesWithSegwit: payFeesWithSegwit,
            psbtTx: psbtTx,
            feeRate: feeRate,
            taprootUtxos: nonMetaUtxos,
            taprootAddress: taprootAddress,
            segwitUtxos: segwitUtxos,
            segwitAddress: segwitAddress,
        });
        const remainingUnspent = psbtTx.getUnspent();
        if (remainingUnspent <= 0) {
            throw new Error('Not enough balance for the fee');
        }
        const psbt = yield psbtTx.createSignedPsbt();
        psbtTx.dumpTx(psbt);
        return psbt;
    });
}
exports.buildOrdTx = buildOrdTx;
const getUtxosForFees = ({ payFeesWithSegwit, psbtTx, feeRate, taprootUtxos, taprootAddress, segwitUtxos, segwitAddress, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (payFeesWithSegwit && segwitUtxos) {
        yield addSegwitFeeUtxo({
            segwitUtxos: segwitUtxos,
            feeRate: feeRate,
            psbtTx: psbtTx,
            segwitAddress: segwitAddress,
        });
        return;
    }
    yield addTaprootFeeUtxo({
        taprootUtxos: taprootUtxos,
        feeRate: feeRate,
        psbtTx: psbtTx,
        taprootAddress: taprootAddress,
    });
    return;
});
const addSegwitFeeUtxo = ({ segwitUtxos, feeRate, psbtTx, segwitAddress, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { nonMetaSegwitUtxos } = segwitUtxos.reduce((acc, utxo) => {
        utxo.inscriptions.length > 0
            ? acc.metaUtxos.push(utxo)
            : acc.nonMetaSegwitUtxos.push(utxo);
        return acc;
    }, { metaUtxos: [], nonMetaSegwitUtxos: [] });
    nonMetaSegwitUtxos.sort((a, b) => a.satoshis - b.satoshis);
    const vB = psbtTx.getNumberOfInputs() * 149 + 3 * 32 + 12;
    const fee = vB * feeRate;
    const feeUtxo = nonMetaSegwitUtxos.find((utxo) => {
        return utxo.satoshis - fee > 0 ? utxo : undefined;
    });
    if (!feeUtxo) {
        throw new Error('No available UTXOs');
    }
    psbtTx.addInput(feeUtxo, true);
    psbtTx.addOutput(segwitAddress, feeUtxo.satoshis - fee);
    return;
});
const addTaprootFeeUtxo = ({ taprootUtxos, feeRate, psbtTx, taprootAddress, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { nonMetaTaprootUtxos } = taprootUtxos.reduce((acc, utxo) => {
        utxo.inscriptions.length > 0
            ? acc.metaUtxos.push(utxo)
            : acc.nonMetaTaprootUtxos.push(utxo);
        return acc;
    }, { metaUtxos: [], nonMetaTaprootUtxos: [] });
    nonMetaTaprootUtxos.sort((a, b) => a.satoshis - b.satoshis);
    const vB = psbtTx.getNumberOfInputs() * 149 + 3 * 32 + 12;
    const fee = vB * feeRate;
    const feeUtxo = nonMetaTaprootUtxos.find((utxo) => {
        return utxo.satoshis - fee > 0 ? utxo : undefined;
    });
    if (!feeUtxo) {
        throw new Error('No available UTXOs');
    }
    psbtTx.addInput(feeUtxo, false);
    psbtTx.addOutput(taprootAddress, feeUtxo.satoshis - fee);
    return;
});
const addInscriptionUtxo = ({ metaUtxos, inscriptionId, toAddress, psbtTx, }) => __awaiter(void 0, void 0, void 0, function* () {
    const matchedUtxo = metaUtxos.find((utxo) => {
        return utxo.inscriptions.some((inscription) => inscription.id === inscriptionId);
    });
    if (!matchedUtxo || matchedUtxo.inscriptions.length > 1) {
        throw new Error(matchedUtxo
            ? 'Multiple inscriptions! Please split first.'
            : 'Inscription not detected.');
    }
    psbtTx.addInput(matchedUtxo);
    psbtTx.addOutput(toAddress, matchedUtxo.satoshis);
    return;
});
//# sourceMappingURL=buildOrdTx.js.map