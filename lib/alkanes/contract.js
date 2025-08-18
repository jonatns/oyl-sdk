"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoverCommit = exports.deployReveal = exports.actualDeployRevealFee = exports.actualDeployCommitFee = exports.contractDeployment = void 0;
const tslib_1 = require("tslib");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const utils_1 = require("../shared/utils");
const alkanes_1 = require("./alkanes");
const psbt_1 = require("../psbt");
const contractDeployment = async ({ payload, utxos, account, protostone, provider, feeRate, signer, }) => {
    const { script, txId } = await (0, alkanes_1.deployCommit)({
        payload,
        utxos,
        account,
        provider,
        feeRate,
        signer,
    });
    await (0, utils_1.timeout)(3000);
    const reveal = await (0, exports.deployReveal)({
        commitTxId: txId,
        script,
        protostone,
        account,
        provider,
        feeRate,
        signer,
    });
    return { ...reveal, commitTx: txId };
};
exports.contractDeployment = contractDeployment;
const actualDeployCommitFee = async ({ payload, tweakedPublicKey, utxos, account, provider, feeRate, }) => {
    if (!feeRate) {
        feeRate = (await provider.esplora.getFeeEstimates())['1'];
    }
    const { psbt } = await (0, alkanes_1.createDeployCommitPsbt)({
        payload,
        utxos,
        tweakedPublicKey,
        account,
        provider,
        feeRate,
    });
    const { fee: estimatedFee } = await (0, psbt_1.getEstimatedFee)({
        feeRate,
        psbt,
        provider,
    });
    const { psbt: finalPsbt } = await (0, alkanes_1.createDeployCommitPsbt)({
        payload,
        utxos,
        tweakedPublicKey,
        account,
        provider,
        feeRate,
        fee: estimatedFee,
    });
    const { fee: finalFee, vsize } = await (0, psbt_1.getEstimatedFee)({
        feeRate,
        psbt: finalPsbt,
        provider,
    });
    return { fee: finalFee, vsize };
};
exports.actualDeployCommitFee = actualDeployCommitFee;
const actualDeployRevealFee = async ({ protostone, tweakedPublicKey, commitTxId, receiverAddress, script, provider, feeRate, }) => {
    if (!feeRate) {
        feeRate = (await provider.esplora.getFeeEstimates())['1'];
    }
    const { psbt } = await (0, alkanes_1.createDeployRevealPsbt)({
        protostone,
        commitTxId,
        receiverAddress,
        script,
        tweakedPublicKey,
        provider,
        feeRate,
    });
    const { fee: estimatedFee } = await (0, psbt_1.getEstimatedFee)({
        feeRate,
        psbt,
        provider,
    });
    const { psbt: finalPsbt } = await (0, alkanes_1.createDeployRevealPsbt)({
        protostone,
        commitTxId,
        receiverAddress,
        script,
        tweakedPublicKey,
        provider,
        feeRate,
        fee: estimatedFee,
    });
    const { fee: finalFee, vsize } = await (0, psbt_1.getEstimatedFee)({
        feeRate,
        psbt: finalPsbt,
        provider,
    });
    return { fee: finalFee, vsize };
};
exports.actualDeployRevealFee = actualDeployRevealFee;
const deployReveal = async ({ protostone, commitTxId, script, account, provider, feeRate, signer, }) => {
    const tweakedTaprootKeyPair = (0, utils_1.tweakSigner)(signer.taprootKeyPair, {
        network: provider.network,
    });
    const tweakedPublicKey = tweakedTaprootKeyPair.publicKey.toString('hex');
    const { fee } = await (0, exports.actualDeployRevealFee)({
        protostone,
        tweakedPublicKey,
        receiverAddress: account.taproot.address,
        commitTxId,
        script: Buffer.from(script, 'hex'),
        provider,
        feeRate,
    });
    const { psbt: finalRevealPsbt } = await (0, alkanes_1.createDeployRevealPsbt)({
        protostone,
        tweakedPublicKey,
        receiverAddress: account.taproot.address,
        commitTxId,
        script: Buffer.from(script, 'hex'),
        provider,
        feeRate,
        fee,
    });
    let finalReveal = bitcoin.Psbt.fromBase64(finalRevealPsbt, {
        network: provider.network,
    });
    finalReveal.signInput(0, tweakedTaprootKeyPair);
    finalReveal.finalizeInput(0);
    const finalSignedPsbt = finalReveal.toBase64();
    const revealResult = await provider.pushPsbt({
        psbtBase64: finalSignedPsbt,
    });
    return revealResult;
};
exports.deployReveal = deployReveal;
const recoverCommit = async ({ commitTxId, utxos, account, provider, feeRate, signer, }) => {
    const commitTx = await provider.esplora.getTxInfo(commitTxId);
    if (!commitTx) {
        throw new Error(`Commit tx not found for txid: ${commitTxId}`);
    }
    const voutIndex = commitTx.vout.findIndex((vout) => vout.scriptpubkey_address === account.taproot.address);
    if (voutIndex === -1) {
        throw new Error('Could not find vout for commit transaction');
    }
    const commitVout = commitTx.vout[voutIndex];
    const psbt = new bitcoin.Psbt({ network: provider.network });
    psbt.addInput({
        hash: commitTxId,
        index: voutIndex,
        witnessUtxo: {
            script: Buffer.from(commitVout.scriptpubkey, 'hex'),
            value: commitVout.value,
        },
        tapInternalKey: Buffer.from(account.taproot.pubKeyXOnly, 'hex'),
    });
    const estimatedFee = (await (0, psbt_1.getEstimatedFee)({
        feeRate,
        psbt: psbt.toBase64(),
        provider,
    }))?.fee || 2000;
    let totalValue = commitVout.value;
    if (totalValue < estimatedFee) {
        const satsNeeded = estimatedFee - totalValue;
        const spendableUtxos = utxos.filter((utxo) => utxo.txId !== commitTxId &&
            utxo.inscriptions.length === 0 &&
            Object.keys(utxo.runes).length === 0 &&
            Object.keys(utxo.alkanes).length === 0);
        const gatheredUtxos = (0, utils_1.findXAmountOfSats)(spendableUtxos, satsNeeded);
        if (gatheredUtxos.totalAmount < satsNeeded) {
            throw new Error('Insufficient funds to pay for recovery transaction fee');
        }
        for (const utxo of gatheredUtxos.utxos) {
            psbt.addInput({
                hash: utxo.txId,
                index: utxo.outputIndex,
                witnessUtxo: {
                    script: Buffer.from(utxo.scriptPk, 'hex'),
                    value: utxo.satoshis,
                },
            });
            totalValue += utxo.satoshis;
        }
    }
    psbt.addOutput({
        address: account.nativeSegwit.address,
        value: totalValue - estimatedFee,
    });
    const signedPsbt = await signer.signAllInputs({
        rawPsbt: psbt.toBase64(),
        finalize: true,
    });
    return provider.pushPsbt({ psbtBase64: signedPsbt.signedPsbt });
};
exports.recoverCommit = recoverCommit;
//# sourceMappingURL=contract.js.map