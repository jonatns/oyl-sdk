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
exports.transfer = exports.reveal = exports.commit = exports.transferEstimate = void 0;
const errors_1 = require("../errors");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utxo_1 = require("../utxo");
const utils_1 = require("../shared/utils");
const btc_1 = require("../btc");
const bip371_1 = require("bitcoinjs-lib/src/psbt/bip371");
const bip341_1 = require("bitcoinjs-lib/src/payments/bip341");
const transactions_1 = require("../transactions");
const transferEstimate = async ({ toAddress, feeRate, account, provider, fee, }) => {
    try {
        if (!feeRate) {
            feeRate = (await provider.esplora.getFeeEstimates())['1'];
        }
        const psbt = new bitcoin.Psbt({ network: provider.network });
        const minFee = (0, btc_1.minimumFee)({
            taprootInputCount: 2,
            nonTaprootInputCount: 0,
            outputCount: 2,
        });
        let calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate;
        let finalFee = fee ? fee : calculatedFee;
        const gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
            account,
            provider,
            spendAmount: finalFee + 546,
        });
        let utxosToSend = gatheredUtxos;
        if (!fee && gatheredUtxos.utxos.length > 1) {
            const txSize = (0, btc_1.minimumFee)({
                taprootInputCount: gatheredUtxos.utxos.length,
                nonTaprootInputCount: 0,
                outputCount: 2,
            });
            finalFee = txSize * feeRate < 250 ? 250 : txSize * feeRate;
            if (gatheredUtxos.totalAmount < finalFee + 546) {
                utxosToSend = await (0, utxo_1.accountSpendableUtxos)({
                    account,
                    provider,
                    spendAmount: finalFee + 546,
                });
            }
        }
        for (let i = 0; i < utxosToSend.utxos.length; i++) {
            psbt.addInput({
                hash: utxosToSend.utxos[i].txId,
                index: utxosToSend.utxos[i].outputIndex,
                witnessUtxo: {
                    value: utxosToSend.utxos[i].satoshis,
                    script: Buffer.from(utxosToSend.utxos[i].scriptPk, 'hex'),
                },
            });
        }
        psbt.addOutput({
            address: toAddress,
            value: 546,
        });
        const changeAmount = utxosToSend.totalAmount - (finalFee + 546);
        psbt.addOutput({
            address: account[account.spendStrategy.changeAddress].address,
            value: changeAmount,
        });
        const updatedPsbt = await (0, utils_1.formatInputsToSign)({
            _psbt: psbt,
            senderPublicKey: account.taproot.pubkey,
            network: provider.network,
        });
        return { psbt: updatedPsbt.toBase64(), fee: finalFee };
    }
    catch (error) {
        throw new errors_1.OylTransactionError(error);
    }
};
exports.transferEstimate = transferEstimate;
const commit = async ({ ticker, amount, feeRate, account, provider, fee, finalSendFee, }) => {
    try {
        const content = `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amount}"}`;
        if (!feeRate) {
            feeRate = (await provider.esplora.getFeeEstimates())['1'];
        }
        const psbt = new bitcoin.Psbt({ network: provider.network });
        const commitTxSize = (0, utils_1.calculateTaprootTxSize)(1, 0, 2);
        const feeForCommit = commitTxSize * feeRate < 250 ? 250 : commitTxSize * feeRate;
        const revealTxSize = (0, utils_1.calculateTaprootTxSize)(1, 0, 2);
        const feeForReveal = revealTxSize * feeRate < 250 ? 250 : revealTxSize * feeRate;
        const baseEstimate = Number(feeForCommit) + Number(feeForReveal) + finalSendFee + 546;
        let calculatedFee = baseEstimate * feeRate < 250 ? 250 : baseEstimate * feeRate;
        let finalFee = fee
            ? fee + Number(feeForReveal) + 546 + finalSendFee
            : calculatedFee;
        let gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
            account,
            provider,
            spendAmount: finalFee,
        });
        const taprootKeyPair = utils_1.ECPair.fromPrivateKey(Buffer.from(account.taproot.privateKey, 'hex'));
        const tweakedTaprootKeyPair = (0, bip371_1.toXOnly)((0, utils_1.tweakSigner)(taprootKeyPair).publicKey);
        const script = (0, utils_1.createInscriptionScript)(tweakedTaprootKeyPair, content);
        const outputScript = bitcoin.script.compile(script);
        const inscriberInfo = bitcoin.payments.p2tr({
            internalPubkey: tweakedTaprootKeyPair,
            scriptTree: { output: outputScript },
            network: provider.network,
        });
        psbt.addOutput({
            value: Number(feeForReveal) + 546,
            address: inscriberInfo.address,
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
        for (let i = 0; i < gatheredUtxos.utxos.length; i++) {
            // if (getAddressType(gatheredUtxos.utxos[i].address) === 0) {
            //   const previousTxHex: string =
            //     await provider.sandshrew.bitcoindRpc.getTransaction(
            //       gatheredUtxos.utxos[i].txId
            //     )
            //   psbt.addInput({
            //     hash: gatheredUtxos.utxos[i].txId,
            //     index: gatheredUtxos.utxos[i].outputIndex,
            //     nonWitnessUtxo: Buffer.from(previousTxHex, 'hex'),
            //   })
            // }
            if ((0, transactions_1.getAddressType)(gatheredUtxos.utxos[i].address) === 2) {
                const redeemScript = bitcoin.script.compile([
                    bitcoin.opcodes.OP_0,
                    bitcoin.crypto.hash160(Buffer.from(account.nestedSegwit.pubkey, 'hex')),
                ]);
                psbt.addInput({
                    hash: gatheredUtxos.utxos[i].txId,
                    index: gatheredUtxos.utxos[i].outputIndex,
                    redeemScript: redeemScript,
                    witnessUtxo: {
                        value: gatheredUtxos.utxos[i].satoshis,
                        script: bitcoin.script.compile([
                            bitcoin.opcodes.OP_HASH160,
                            bitcoin.crypto.hash160(redeemScript),
                            bitcoin.opcodes.OP_EQUAL,
                        ]),
                    },
                });
            }
            if ((0, transactions_1.getAddressType)(gatheredUtxos.utxos[i].address) === 1 ||
                (0, transactions_1.getAddressType)(gatheredUtxos.utxos[i].address) === 3) {
                psbt.addInput({
                    hash: gatheredUtxos.utxos[i].txId,
                    index: gatheredUtxos.utxos[i].outputIndex,
                    witnessUtxo: {
                        value: gatheredUtxos.utxos[i].satoshis,
                        script: Buffer.from(gatheredUtxos.utxos[i].scriptPk, 'hex'),
                    },
                });
            }
        }
        const changeAmount = gatheredUtxos.totalAmount - finalFee;
        psbt.addOutput({
            address: account[account.spendStrategy.changeAddress].address,
            value: changeAmount,
        });
        const updatedPsbt = await (0, utils_1.formatInputsToSign)({
            _psbt: psbt,
            senderPublicKey: account.taproot.pubkey,
            network: provider.network,
        });
        return { psbt: updatedPsbt.toBase64(), fee: finalFee, script: outputScript };
    }
    catch (error) {
        throw new errors_1.OylTransactionError(error);
    }
};
exports.commit = commit;
const reveal = async ({ receiverAddress, script, feeRate, account, provider, fee = 0, commitTxId, }) => {
    try {
        if (!feeRate) {
            feeRate = (await provider.esplora.getFeeEstimates())['1'];
        }
        const psbt = new bitcoin.Psbt({ network: provider.network });
        const minFee = (0, btc_1.minimumFee)({
            taprootInputCount: 1,
            nonTaprootInputCount: 0,
            outputCount: 2,
        });
        const revealTxBaseFee = minFee * feeRate < 250 ? 250 : minFee * feeRate;
        const revealTxChange = Number(revealTxBaseFee) - fee;
        const commitTxOutput = await (0, utils_1.getOutputValueByVOutIndex)({
            txId: commitTxId,
            vOut: 0,
            esploraRpc: provider.esplora,
        });
        if (!commitTxOutput) {
            throw new Error('ERROR GETTING FIRST INPUT VALUE');
        }
        const taprootKeyPair = utils_1.ECPair.fromPrivateKey(Buffer.from(account.taproot.privateKey, 'hex'));
        const tweakedTaprootKeyPair = (0, utils_1.tweakSigner)(taprootKeyPair, {
            network: provider.network,
        });
        const tweakedPubKey = (0, bip371_1.toXOnly)((0, utils_1.tweakSigner)(taprootKeyPair, { network: provider.network }).publicKey);
        const p2pk_redeem = { output: script };
        const { output, witness } = bitcoin.payments.p2tr({
            internalPubkey: tweakedPubKey,
            scriptTree: p2pk_redeem,
            redeem: p2pk_redeem,
            network: provider.network,
        });
        psbt.addInput({
            hash: commitTxId,
            index: 0,
            witnessUtxo: {
                value: commitTxOutput.value,
                script: output,
            },
            tapLeafScript: [
                {
                    leafVersion: bip341_1.LEAF_VERSION_TAPSCRIPT,
                    script: p2pk_redeem.output,
                    controlBlock: witness[witness.length - 1],
                },
            ],
        });
        psbt.addOutput({
            value: 546,
            address: receiverAddress,
        });
        if (revealTxChange > 546) {
            psbt.addOutput({
                value: revealTxChange,
                address: receiverAddress,
            });
        }
        psbt.signInput(0, tweakedTaprootKeyPair);
        psbt.finalizeInput(0);
        return { psbt: psbt.toBase64(), fee: revealTxChange };
    }
    catch (error) {
        throw new errors_1.OylTransactionError(error);
    }
};
exports.reveal = reveal;
const transfer = async ({ commitChangeUtxoId, revealTxId, toAddress, feeRate, account, provider, fee = 0, }) => {
    try {
        if (!feeRate) {
            feeRate = (await provider.esplora.getFeeEstimates())['1'];
        }
        const psbt = new bitcoin.Psbt({ network: provider.network });
        const utxoInfo = await provider.esplora.getTxInfo(commitChangeUtxoId);
        const revealInfo = await provider.esplora.getTxInfo(revealTxId);
        let totalValue = 0;
        psbt.addInput({
            hash: revealTxId,
            index: 0,
            witnessUtxo: {
                script: Buffer.from(revealInfo.vout[0].scriptpubkey, 'hex'),
                value: 546,
            },
        });
        for (let i = 1; i <= utxoInfo.vout.length - 1; i++) {
            totalValue += utxoInfo.vout[i].value;
            psbt.addInput({
                hash: commitChangeUtxoId,
                index: i,
                witnessUtxo: {
                    script: Buffer.from(utxoInfo.vout[i].scriptpubkey, 'hex'),
                    value: utxoInfo.vout[i].value,
                },
            });
        }
        psbt.addOutput({
            address: toAddress,
            value: 546,
        });
        psbt.addOutput({
            address: account[account.spendStrategy.changeAddress].address,
            value: totalValue - fee,
        });
        const formattedPsbt = await (0, utils_1.formatInputsToSign)({
            _psbt: psbt,
            senderPublicKey: account.taproot.pubkey,
            network: provider.network,
        });
        return { psbt: formattedPsbt.toBase64() };
    }
    catch (error) {
        throw new errors_1.OylTransactionError(error);
    }
};
exports.transfer = transfer;
//# sourceMappingURL=index.js.map