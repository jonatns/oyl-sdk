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
exports.mint = exports.send = exports.actualMintFee = exports.actualSendFee = exports.findRuneUtxos = exports.createMintPsbt = exports.createSendPsbt = void 0;
const btc_1 = require("../btc");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utxo_1 = require("../utxo");
const utils_1 = require("../shared/utils");
const errors_1 = require("../errors");
const transactions_1 = require("../transactions");
const createSendPsbt = async ({ account, runeId, provider, inscriptionAddress = account.taproot.address, toAddress, amount, feeRate, fee, }) => {
    try {
        const minFee = (0, btc_1.minimumFee)({
            taprootInputCount: 2,
            nonTaprootInputCount: 0,
            outputCount: 3,
        });
        const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate;
        let finalFee = fee ? fee : calculatedFee;
        let gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
            account,
            provider,
            spendAmount: finalFee + utils_1.inscriptionSats,
        });
        let psbt = new bitcoin.Psbt({ network: provider.network });
        const { runeUtxos, runeTotalSatoshis } = await (0, exports.findRuneUtxos)({
            address: inscriptionAddress,
            provider,
            runeId,
        });
        for await (const utxo of runeUtxos) {
            psbt.addInput({
                hash: utxo.txId,
                index: parseInt(utxo.txIndex),
                witnessUtxo: {
                    script: Buffer.from(utxo.script, 'hex'),
                    value: utxo.satoshis,
                },
            });
        }
        if (!fee && gatheredUtxos.utxos.length > 1) {
            const txSize = (0, btc_1.minimumFee)({
                taprootInputCount: gatheredUtxos.utxos.length,
                nonTaprootInputCount: 0,
                outputCount: 3,
            });
            finalFee = txSize * feeRate < 250 ? 250 : txSize * feeRate;
            if (gatheredUtxos.totalAmount < finalFee) {
                gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
                    account,
                    provider,
                    spendAmount: finalFee + utils_1.inscriptionSats,
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
        if (gatheredUtxos.totalAmount < finalFee + utils_1.inscriptionSats) {
            throw new errors_1.OylTransactionError(Error('Insufficient Balance'));
        }
        const changeAmount = gatheredUtxos.totalAmount - (finalFee + utils_1.inscriptionSats);
        psbt.addOutput({
            value: utils_1.inscriptionSats,
            address: account[account.spendStrategy.changeAddress].address,
        });
        psbt.addOutput({
            value: runeTotalSatoshis,
            address: toAddress,
        });
        psbt.addOutput({
            address: account[account.spendStrategy.changeAddress].address,
            value: changeAmount,
        });
        const script = (0, utils_1.createRuneSendScript)({
            runeId,
            amount,
            sendOutputIndex: 1,
            pointer: 0,
        });
        const output = { script: script, value: 0 };
        psbt.addOutput(output);
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
exports.createSendPsbt = createSendPsbt;
const createMintPsbt = async ({ account, runeId, provider, amount, feeRate, fee, }) => {
    try {
        const minFee = (0, btc_1.minimumFee)({
            taprootInputCount: 2,
            nonTaprootInputCount: 0,
            outputCount: 2,
        });
        const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate;
        let finalFee = fee ? fee : calculatedFee;
        let gatheredUtxos = await (0, utxo_1.accountSpendableUtxos)({
            account,
            provider,
            spendAmount: finalFee + utils_1.inscriptionSats,
        });
        let psbt = new bitcoin.Psbt({ network: provider.network });
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
                    spendAmount: finalFee + utils_1.inscriptionSats,
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
        if (gatheredUtxos.totalAmount < finalFee + utils_1.inscriptionSats) {
            throw new errors_1.OylTransactionError(Error('Insufficient Balance'));
        }
        const changeAmount = gatheredUtxos.totalAmount - (finalFee + utils_1.inscriptionSats);
        psbt.addOutput({
            value: utils_1.inscriptionSats,
            address: account[account.spendStrategy.changeAddress].address,
        });
        psbt.addOutput({
            address: account[account.spendStrategy.changeAddress].address,
            value: changeAmount,
        });
        const script = (0, utils_1.createRuneMintScript)({
            runeId,
            amountToMint: amount,
            mintOutPutIndex: 1,
            pointer: 0,
        });
        const output = { script: script, value: 0 };
        psbt.addOutput(output);
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
exports.createMintPsbt = createMintPsbt;
const findRuneUtxos = async ({ address, provider, runeId, }) => {
    const runeUtxos = [];
    const runeUtxoOutpoints = await provider.api.getRuneOutpoints({
        address: address,
    });
    let runeTotalSatoshis = 0;
    for (const rune of runeUtxoOutpoints) {
        const index = rune.rune_ids.indexOf(runeId);
        if (index !== -1) {
            const txSplit = rune.output.split(':');
            const txHash = txSplit[0];
            const txIndex = txSplit[1];
            const txDetails = await provider.esplora.getTxInfo(txHash);
            if (!txDetails?.vout || txDetails.vout.length < 1) {
                throw new Error('Unable to find rune utxo');
            }
            const satoshis = txDetails.vout[txIndex].value;
            runeUtxos.push({
                txId: txHash,
                txIndex: txIndex,
                script: rune.pkscript,
                amount: rune.balances[index],
                satoshis: satoshis,
            });
            runeTotalSatoshis += satoshis;
        }
    }
    return { runeUtxos, runeTotalSatoshis };
};
exports.findRuneUtxos = findRuneUtxos;
const actualSendFee = async ({ account, runeId, provider, inscriptionAddress = account.taproot.address, toAddress, amount, feeRate, signer, }) => {
    if (!feeRate) {
        feeRate = (await provider.esplora.getFeeEstimates())['1'];
    }
    const { psbt } = await (0, exports.createSendPsbt)({
        account,
        runeId,
        provider,
        inscriptionAddress,
        toAddress,
        amount,
        feeRate,
    });
    const { signedPsbt } = await signer.signAllInputs({
        rawPsbt: psbt,
        finalize: true,
    });
    const vsize = (await provider.sandshrew.bitcoindRpc.decodePSBT(signedPsbt))
        .tx.vsize;
    const correctFee = vsize * feeRate;
    const { psbt: finalPsbt } = await (0, exports.createSendPsbt)({
        account,
        runeId,
        provider,
        inscriptionAddress,
        toAddress,
        amount,
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
exports.actualSendFee = actualSendFee;
const actualMintFee = async ({ account, runeId, provider, amount, feeRate, signer, }) => {
    if (!feeRate) {
        feeRate = (await provider.esplora.getFeeEstimates())['1'];
    }
    const { psbt } = await (0, exports.createMintPsbt)({
        account,
        runeId,
        provider,
        amount,
        feeRate,
    });
    const { signedPsbt } = await signer.signAllInputs({
        rawPsbt: psbt,
        finalize: true,
    });
    const vsize = (await provider.sandshrew.bitcoindRpc.decodePSBT(signedPsbt))
        .tx.vsize;
    const correctFee = vsize * feeRate;
    const { psbt: finalPsbt } = await (0, exports.createMintPsbt)({
        account,
        runeId,
        provider,
        amount,
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
exports.actualMintFee = actualMintFee;
const send = async ({ account, runeId, provider, inscriptionAddress = account.taproot.address, toAddress, amount, feeRate, signer, }) => {
    const { fee } = await (0, exports.actualSendFee)({
        account,
        runeId,
        amount,
        provider,
        toAddress,
        inscriptionAddress,
        feeRate,
        signer,
    });
    const { psbt: finalPsbt } = await (0, exports.createSendPsbt)({
        account,
        runeId,
        amount,
        provider,
        toAddress,
        inscriptionAddress,
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
const mint = async ({ account, runeId, provider, amount, feeRate, signer, }) => {
    const { fee } = await (0, exports.actualMintFee)({
        account,
        runeId,
        amount,
        provider,
        feeRate,
        signer,
    });
    const { psbt: finalPsbt } = await (0, exports.createMintPsbt)({
        account,
        runeId,
        amount,
        provider,
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
exports.mint = mint;
//# sourceMappingURL=index.js.map