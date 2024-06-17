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
exports.actualFee = exports.send = exports.findCollectible = exports.createPsbt = void 0;
const btc_1 = require("../btc");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utxo_1 = require("../utxo");
const utils_1 = require("../shared/utils");
const errors_1 = require("../errors");
const transactions_1 = require("../transactions");
const createPsbt = async ({ account, inscriptionId, provider, inscriptionAddress, toAddress, feeRate, fee, }) => {
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
            address: inscriptionAddress,
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
        for (let i = 0; i < gatheredUtxos.utxos.length; i++) {
            if ((0, transactions_1.getAddressType)(gatheredUtxos.utxos[i].address) === 0) {
                const previousTxHex = await provider.esplora.getTxHex(gatheredUtxos.utxos[i].txId);
                psbt.addInput({
                    hash: gatheredUtxos.utxos[i].txId,
                    index: gatheredUtxos.utxos[i].outputIndex,
                    nonWitnessUtxo: Buffer.from(previousTxHex, 'hex'),
                });
            }
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
        if (gatheredUtxos.totalAmount < finalFee) {
            throw new errors_1.OylTransactionError(Error('Insufficient Balance'));
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
exports.createPsbt = createPsbt;
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
const send = async ({ account, inscriptionId, provider, inscriptionAddress = account.taproot.address, toAddress, feeRate, signer, }) => {
    const { fee } = await (0, exports.actualFee)({
        account,
        inscriptionId,
        provider,
        inscriptionAddress,
        toAddress,
        feeRate,
        signer,
    });
    const { psbt: finalPsbt } = await (0, exports.createPsbt)({
        account,
        inscriptionId,
        provider,
        toAddress,
        inscriptionAddress: inscriptionAddress,
        feeRate,
        fee: fee,
    });
    const { signedPsbt } = await signer.signAllInputs({
        rawPsbt: finalPsbt,
        finalize: true,
    });
    const result = await provider.pushPsbt({
        psbtBase64: signedPsbt,
    });
    return result;
};
exports.send = send;
const actualFee = async ({ account, inscriptionId, provider, inscriptionAddress, toAddress, feeRate, signer, }) => {
    const { psbt } = await (0, exports.createPsbt)({
        account,
        inscriptionId,
        provider,
        inscriptionAddress,
        toAddress,
        feeRate,
    });
    const { signedPsbt } = await signer.signAllInputs({
        rawPsbt: psbt,
        finalize: true,
    });
    const vsize = (await provider.sandshrew.bitcoindRpc.decodePSBT(signedPsbt))
        .tx.vsize;
    const correctFee = vsize * feeRate;
    const { psbt: finalPsbt } = await (0, exports.createPsbt)({
        account,
        inscriptionId,
        provider,
        inscriptionAddress,
        toAddress,
        feeRate,
        fee: correctFee,
    });
    const { signedPsbt: signedAll } = await signer.signAllInputs({
        rawPsbt: finalPsbt,
        finalize: true,
    });
    const finalVsize = (await provider.sandshrew.bitcoindRpc.decodePSBT(signedAll)).tx.vsize;
    const finalFee = finalVsize * feeRate;
    return { fee: finalFee };
};
exports.actualFee = actualFee;
//# sourceMappingURL=index.js.map