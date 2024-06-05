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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCollectible = void 0;
const btc_1 = require("../btc");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utxo_1 = require("../utxo");
const utils_1 = require("../shared/utils");
const sendCollectible = async ({ account, inscriptionId, provider, toAddress, feeRate, fee, }) => {
    const minFee = (0, btc_1.minimumFee)({
        taprootInputCount: 1,
        nonTaprootInputCount: 0,
        outputCount: 2,
    });
    const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate;
    let finalFee = fee ? fee : calculatedFee;
    const gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
        account,
        provider,
        spendAmount: finalFee,
    });
    let psbt = new bitcoin.Psbt({ network: provider.network });
    const { txId, voutIndex, data } = await (0, utxo_1.findCollectible)({
        account,
        provider,
        inscriptionId,
    });
    psbt.addInput({
        hash: txId,
        index: parseInt(voutIndex),
        witnessUtxo: {
            script: Buffer.from(data.scriptpubkey, 'hex'),
            value: data.value,
        },
    });
    psbt.addOutput({
        address: toAddress,
        value: data.value,
    });
    let utxosToSend = (0, utxo_1.findUtxosToCoverAmount)(gatheredUtxos.utxos, finalFee);
    if (utxosToSend?.selectedUtxos.length > 1) {
        const newTxSize = (0, btc_1.minimumFee)({
            taprootInputCount: utxosToSend.selectedUtxos.length,
            nonTaprootInputCount: 0,
            outputCount: 2,
        });
        fee = newTxSize * feeRate < 250 ? 250 : newTxSize * feeRate;
        utxosToSend = (0, utxo_1.findUtxosToCoverAmount)(gatheredUtxos.utxos, finalFee);
        if (utxosToSend.totalSatoshis < finalFee) {
            return { estimatedFee: finalFee, satsFound: gatheredUtxos.totalAmount };
        }
    }
    for await (const utxo of utxosToSend.selectedUtxos) {
        psbt.addInput({
            hash: utxo.txId,
            index: utxo.outputIndex,
            witnessUtxo: {
                script: Buffer.from(utxo.scriptPk, 'hex'),
                value: utxo.satoshis,
            },
        });
    }
    const changeAmount = fee
        ? utxosToSend.totalSatoshis - fee
        : utxosToSend.totalSatoshis - finalFee;
    psbt.addOutput({
        address: account[account.spendStrategy.changeAddress].address,
        value: changeAmount,
    });
    const formattedPsbtTx = await (0, utils_1.formatInputsToSign)({
        _psbt: psbt,
        senderPublicKey: account.taproot.pubkey,
        network: provider.network,
    });
    return { rawPsbt: formattedPsbtTx.toBase64() };
};
exports.sendCollectible = sendCollectible;
//# sourceMappingURL=index.js.map