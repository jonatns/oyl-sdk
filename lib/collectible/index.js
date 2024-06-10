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
exports.findCollectible = exports.sendTx = void 0;
const btc_1 = require("../btc");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utxo_1 = require("../utxo");
const utils_1 = require("../shared/utils");
const errors_1 = require("../errors");
const sendTx = async ({ account, inscriptionId, provider, toAddress, feeRate, fee, }) => {
    try {
        const minFee = (0, btc_1.minimumFee)({
            taprootInputCount: 1,
            nonTaprootInputCount: 0,
            outputCount: 2,
        });
        const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate;
        let finalFee = fee ? fee : calculatedFee;
        let gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
            account,
            provider,
            spendAmount: finalFee,
        });
        let psbt = new bitcoin.Psbt({ network: provider.network });
        const { txId, voutIndex, data } = await (0, exports.findCollectible)({
            address: account.taproot.address,
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
        if (!fee && gatheredUtxos.utxos.length > 1) {
            const txSize = (0, btc_1.minimumFee)({
                taprootInputCount: gatheredUtxos.utxos.length,
                nonTaprootInputCount: 0,
                outputCount: 2,
            });
            finalFee = txSize * feeRate < 250 ? 250 : txSize * feeRate;
            if (gatheredUtxos.totalAmount < finalFee) {
                gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
                    account,
                    provider,
                    spendAmount: finalFee,
                });
            }
        }
        for await (const utxo of gatheredUtxos.utxos) {
            psbt.addInput({
                hash: utxo.txId,
                index: utxo.outputIndex,
                witnessUtxo: {
                    script: Buffer.from(utxo.scriptPk, 'hex'),
                    value: utxo.satoshis,
                },
            });
        }
        const changeAmount = gatheredUtxos.totalAmount - finalFee;
        psbt.addOutput({
            address: account[account.spendStrategy.changeAddress].address,
            value: changeAmount,
        });
        const formattedPsbtTx = await (0, utils_1.formatInputsToSign)({
            _psbt: psbt,
            senderPublicKey: account.taproot.pubkey,
            network: provider.network,
        });
        return { psbt: formattedPsbtTx.toBase64() };
    }
    catch (error) {
        throw new errors_1.OylTransactionError(error);
    }
};
exports.sendTx = sendTx;
const findCollectible = async ({ address, provider, inscriptionId, }) => {
    const collectibleData = await provider.ord.getInscriptionById(inscriptionId);
    if (collectibleData.address !== address) {
        throw new Error('Inscription does not belong to fromAddress');
    }
    const inscriptionTxId = collectibleData.satpoint.split(':')[0];
    const inscriptionTxVOutIndex = collectibleData.satpoint.split(':')[1];
    const inscriptionUtxoDetails = await provider.esplora.getTxInfo(inscriptionTxId);
    const inscriptionUtxoData = inscriptionUtxoDetails.vout[inscriptionTxVOutIndex];
    const isSpentArray = await provider.esplora.getTxOutspends(inscriptionTxId);
    const isSpent = isSpentArray[inscriptionTxVOutIndex];
    if (isSpent.spent) {
        throw new Error('Inscription is missing');
    }
    return {
        txId: inscriptionTxId,
        voutIndex: inscriptionTxVOutIndex,
        data: inscriptionUtxoData,
    };
};
exports.findCollectible = findCollectible;
//# sourceMappingURL=index.js.map