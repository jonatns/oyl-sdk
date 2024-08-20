"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOkxRunesPsbt = void 0;
async function buildOkxRunesPsbt(psbt, orderPrice, sellerAddress) {
    const sellerPsbt = bitcoin.Psbt.fromBase64(psbt, { network: this.provider.network });
    const dummyUtxos = [];
    const requiredSatoshis = orderPrice + parseInt((482 * this.feeRate).toFixed(0));
    const allUtxosWorth600 = await this.getAllUTXOsWorthASpecificValue(600);
    if (allUtxosWorth600.length >= 2) {
        for (let i = 0; i < 2; i++) {
            dummyUtxos.push({
                txHash: allUtxosWorth600[i].txid,
                vout: allUtxosWorth600[i].vout,
                coinAmount: allUtxosWorth600[i].value,
            });
        }
    }
    const retrievedUtxos = await this.getUTXOsToCoverAmount(this.selectedSpendAddress, requiredSatoshis, dummyUtxos);
    if (retrievedUtxos.length === 0) {
        throw new OylTransactionError(new Error('Not enough funds to purchase this offer'), this.txIds);
    }
    const buyerPsbt = new bitcoin.Psbt({ network: this.provider.network });
    const sellerInputData = sellerPsbt.data.inputs[1];
    const decoded = await this.provider.sandshrew.bitcoindRpc.decodePSBT(psbt);
    // Add the first UTXO from retrievedUtxos as input index 0
    buyerPsbt.addInput(this.addInputConditionally({
        hash: retrievedUtxos[0].txid,
        index: retrievedUtxos[0].vout,
        witnessUtxo: {
            value: retrievedUtxos[0].value,
            script: Buffer.from(this.takerScript, 'hex')
        }
    }));
    const sellerUtxo = {
        hash: decoded.tx.vin[1].txid,
        index: decoded.tx.vin[1].vout,
        witnessUtxo: {
            value: sellerInputData.witnessUtxo.value,
            script: sellerInputData.witnessUtxo.script,
        },
        sighashType: bitcoin.Transaction.SIGHASH_SINGLE | bitcoin.Transaction.SIGHASH_ANYONECANPAY,
    };
    if (sellerInputData?.tapInternalKey != null) {
        sellerUtxo["tapInternalKey"] = sellerInputData?.tapInternalKey;
    }
    // Add seller UTXO as input index 1
    buyerPsbt.addInput(sellerUtxo);
    for (let i = 1; i < retrievedUtxos.length; i++) {
        buyerPsbt.addInput(this.addInputConditionally({
            hash: retrievedUtxos[i].txid,
            index: retrievedUtxos[i].vout,
            witnessUtxo: {
                value: retrievedUtxos[i].value,
                script: Buffer.from(this.takerScript, 'hex')
            }
        }));
    }
    buyerPsbt.addOutput({
        address: this.receiveAddress,
        value: sellerInputData.witnessUtxo.value,
    });
    buyerPsbt.addOutput({
        address: sellerAddress,
        value: orderPrice,
    });
    const amountRetrieved = retrievedUtxos?.reduce((prev, currentValue) => prev + currentValue.value, 0);
    const remainder = amountRetrieved - requiredSatoshis;
    if (remainder > 0) {
        buyerPsbt.addOutput({
            address: this.selectedSpendAddress,
            value: remainder,
        });
    }
    const { signedPsbt } = await this.signMarketplacePsbt(buyerPsbt.toBase64(), false);
    return signedPsbt;
}
exports.buildOkxRunesPsbt = buildOkxRunesPsbt;
//# sourceMappingURL=runes.js.map