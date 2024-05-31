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
exports.minimumFee = exports.createTx = exports.constructPsbt = void 0;
const errors_1 = require("../errors");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utxo_1 = require("../utxo");
const utils_1 = require("../shared/utils");
const constructPsbt = async ({ toAddress, feeRate, amount, account, provider, fee, }) => {
    try {
        if (!feeRate) {
            feeRate = (await provider.esplora.getFeeEstimates())['1'];
        }
        const { psbt } = await (0, exports.createTx)({
            account,
            toAddress,
            feeRate,
            amount,
            network: provider.network,
            fee,
            provider,
        });
        return psbt;
    }
    catch (error) {
        throw new errors_1.OylTransactionError(error);
    }
};
exports.constructPsbt = constructPsbt;
const createTx = async ({ toAddress, amount, feeRate, network, account, provider, fee, }) => {
    const psbt = new bitcoin.Psbt({ network: network });
    const minFee = (0, exports.minimumFee)({
        taprootInputCount: 1,
        nonTaprootInputCount: 0,
        outputCount: 2,
    });
    let calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate;
    let finalFee = fee ? fee : calculatedFee;
    const gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
        account,
        provider,
        spendAmount: finalFee,
    });
    let utxosToSend;
    if (gatheredUtxos.utxos.length > 1) {
        const txSize = (0, exports.minimumFee)({
            taprootInputCount: gatheredUtxos.utxos.length,
            nonTaprootInputCount: 0,
            outputCount: 2,
        });
        fee = txSize * feeRate < 250 ? 250 : txSize * feeRate;
        utxosToSend = (0, utxo_1.findUtxosToCoverAmount)(gatheredUtxos.utxos, amount + finalFee);
        if (!utxosToSend) {
            return { estimatedFee: fee, satsFound: gatheredUtxos.totalAmount };
        }
    }
    const amountGathered = (0, utils_1.calculateAmountGatheredUtxo)(utxosToSend.selectedUtxos);
    for (let i = 0; i < utxosToSend.selectedUtxos.length; i++) {
        psbt.addInput({
            hash: utxosToSend.selectedUtxos[i].txId,
            index: utxosToSend.selectedUtxos[i].outputIndex,
            witnessUtxo: {
                value: utxosToSend.selectedUtxos[i].satoshis,
                script: Buffer.from(utxosToSend.selectedUtxos[i].scriptPk, 'hex'),
            },
        });
    }
    psbt.addOutput({
        address: toAddress,
        value: amount,
    });
    const changeAmount = amountGathered - (finalFee + amount);
    psbt.addOutput({
        address: account[account.spendStrategy.changeAddress].address,
        value: changeAmount,
    });
    const updatedPsbt = await (0, utils_1.formatInputsToSign)({
        _psbt: psbt,
        senderPublicKey: account.taproot.pubkey,
        network,
    });
    return { psbt: updatedPsbt.toBase64(), fee: finalFee };
};
exports.createTx = createTx;
const minimumFee = ({ taprootInputCount, nonTaprootInputCount, outputCount, }) => {
    return (0, utils_1.calculateTaprootTxSize)(taprootInputCount, nonTaprootInputCount, outputCount);
};
exports.minimumFee = minimumFee;
//# sourceMappingURL=index.js.map