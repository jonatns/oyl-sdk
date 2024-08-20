"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountSpendableUtxos = exports.addressSpendableUtxos = exports.availableBalance = void 0;
const tslib_1 = require("tslib");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const constants_1 = require("../shared/constants");
const availableBalance = async ({ account, provider, }) => {
    let totalAmount = 0;
    for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
        const address = account[account.spendStrategy.addressOrder[i]].address;
        const { totalAmount: addressTotal } = await (0, exports.addressSpendableUtxos)({
            address,
            provider,
            spendStrategy: account.spendStrategy,
        });
        totalAmount += addressTotal;
    }
    return { balance: totalAmount };
};
exports.availableBalance = availableBalance;
const addressSpendableUtxos = async ({ address, provider, spendAmount, spendStrategy, }) => {
    let totalAmount = 0;
    const formattedUtxos = [];
    let utxos = await provider.esplora.getAddressUtxo(address);
    if (utxos.length === 0) {
        return { totalAmount, utxos: formattedUtxos };
    }
    const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast !== undefined
        ? spendStrategy.utxoSortGreatestToLeast
        : true;
    utxos = utxos
        .filter((utxo) => utxo.value > constants_1.UTXO_DUST && utxo.value !== 546)
        .sort((a, b) => utxoSortGreatestToLeast ? b.value - a.value : a.value - b.value);
    const inscriptionsAndRunesPromises = utxos.map(async (utxo) => {
        const hasInscription = provider.ord.getTxOutput(utxo.txid + ':' + utxo.vout);
        const hasRune = provider.network !== bitcoin.networks.regtest
            ? provider.api.getOutputRune({
                output: utxo.txid + ':' + utxo.vout,
            })
            : Promise.resolve(false);
        return Promise.all([hasInscription, hasRune]);
    });
    const results = await Promise.all(inscriptionsAndRunesPromises);
    for (let i = 0; i < utxos.length; i++) {
        const [hasInscription, hasRune] = results[i];
        if ((spendAmount && totalAmount >= spendAmount) ||
            hasInscription.inscriptions.length > 0 ||
            hasInscription.runes.length > 0 ||
            !hasInscription.indexed ||
            hasInscription.value === 546 ||
            hasRune?.output) {
            continue;
        }
        const transactionDetails = await provider.esplora.getTxInfo(utxos[i].txid);
        const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
        formattedUtxos.push({
            txId: utxos[i].txid,
            outputIndex: utxos[i].vout,
            satoshis: utxos[i].value,
            confirmations: utxos[i].status.confirmed ? 3 : 0,
            scriptPk: voutEntry.scriptpubkey,
            address: address,
            inscriptions: [],
        });
        totalAmount += utxos[i].value;
    }
    return { totalAmount, utxos: formattedUtxos };
};
exports.addressSpendableUtxos = addressSpendableUtxos;
const accountSpendableUtxos = async ({ account, provider, spendAmount, }) => {
    let totalAmount = 0;
    let allUtxos = [];
    let remainingSpendAmount = spendAmount;
    for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
        const address = account[account.spendStrategy.addressOrder[i]].address;
        const { totalAmount: addressTotal, utxos: formattedUtxos } = await (0, exports.addressSpendableUtxos)({
            address,
            provider,
            spendAmount: remainingSpendAmount,
            spendStrategy: account.spendStrategy,
        });
        totalAmount += addressTotal;
        allUtxos = [...allUtxos, ...formattedUtxos];
        if (spendAmount && totalAmount >= spendAmount) {
            return { totalAmount, utxos: allUtxos };
        }
        remainingSpendAmount -= addressTotal;
    }
    return { totalAmount, utxos: allUtxos };
};
exports.accountSpendableUtxos = accountSpendableUtxos;
//# sourceMappingURL=utxo.js.map