"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountUtxos = exports.addressUtxos = exports.accountSpendableUtxos = exports.addressSpendableUtxos = exports.addressBalance = exports.accountBalance = void 0;
const tslib_1 = require("tslib");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const constants_1 = require("../shared/constants");
const tiny_async_pool_1 = tslib_1.__importDefault(require("tiny-async-pool"));
const accountBalance = async ({ account, provider, }) => {
    let confirmedAmount = 0;
    let pendingAmount = 0;
    let amount = 0;
    for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
        const address = account[account.spendStrategy.addressOrder[i]].address;
        const { chain_stats, mempool_stats } = await provider.esplora._call('esplora_address', [address]);
        const btcBalance = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
        const pendingBtcBalance = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;
        confirmedAmount += btcBalance;
        pendingAmount += pendingBtcBalance;
        amount += btcBalance + pendingAmount;
    }
    return {
        confirmedAmount: confirmedAmount / 10 ** 8,
        pendingAmount: pendingAmount / 10 ** 8,
        amount: amount / 10 ** 8,
    };
};
exports.accountBalance = accountBalance;
const addressBalance = async ({ address, provider, }) => {
    let confirmedAmount = 0;
    let pendingAmount = 0;
    let amount = 0;
    const { chain_stats, mempool_stats } = await provider.esplora._call('esplora_address', [address]);
    const btcBalance = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
    const pendingBtcBalance = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;
    confirmedAmount += btcBalance;
    pendingAmount += pendingBtcBalance;
    amount += btcBalance + pendingAmount;
    return {
        confirmedAmount: confirmedAmount / 10 ** 8,
        pendingAmount: pendingAmount / 10 ** 8,
        amount: amount / 10 ** 8,
    };
};
exports.addressBalance = addressBalance;
const addressSpendableUtxos = async ({ address, provider, spendAmount, spendStrategy, }) => {
    let totalAmount = 0;
    const formattedUtxos = [];
    let utxos = await provider.esplora.getAddressUtxo(address);
    if (utxos.length === 0) {
        return { totalAmount, utxos: formattedUtxos };
    }
    const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast ?? true;
    utxos = utxos
        .filter((utxo) => utxo.value > constants_1.UTXO_DUST && utxo.value !== 546)
        .sort((a, b) => utxoSortGreatestToLeast ? b.value - a.value : a.value - b.value);
    const utxoPromises = utxos.map(async (utxo) => {
        const outputId = `${utxo.txid}:${utxo.vout}`;
        const [hasInscription, hasRune] = await Promise.all([
            provider.ord.getTxOutput(outputId),
            provider.network !== bitcoin.networks.regtest
                ? provider.api.getOutputRune({ output: outputId })
                : Promise.resolve(false),
        ]);
        return { utxo, hasInscription, hasRune };
    });
    const results = await Promise.all(utxoPromises);
    for (const { utxo, hasInscription, hasRune } of results) {
        if ((spendAmount && totalAmount >= spendAmount) ||
            hasInscription.inscriptions.length > 0 ||
            hasInscription.runes.length > 0 ||
            !hasInscription.indexed ||
            hasInscription.value === 546 ||
            hasRune?.output) {
            continue;
        }
        const transactionDetails = await provider.esplora.getTxInfo(utxo.txid);
        const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
        formattedUtxos.push({
            txId: utxo.txid,
            outputIndex: utxo.vout,
            satoshis: utxo.value,
            confirmations: utxo.status.confirmed ? 3 : 0,
            scriptPk: voutEntry.scriptpubkey,
            address: address,
            inscriptions: [],
        });
        totalAmount += utxo.value;
        if (spendAmount && totalAmount >= spendAmount) {
            break;
        }
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
const addressUtxos = async ({ address, provider, spendStrategy, }) => {
    let spendableTotalBalance = 0;
    let pendingTotalBalance = 0;
    let totalBalance = 0;
    const spendableUtxos = [];
    const pendingUtxos = [];
    const ordUtxos = [];
    const runeUtxos = [];
    const multiCall = await provider.sandshrew.multiCall([
        ['esplora_address::utxo', [address]],
        ['btc_getblockcount', []],
    ]);
    const blockCount = multiCall[1].result;
    let utxos = multiCall[0].result;
    if (utxos.length === 0) {
        return {
            spendableTotalBalance,
            spendableUtxos,
            runeUtxos,
            ordUtxos,
            pendingUtxos,
            pendingTotalBalance,
            totalBalance,
        };
    }
    const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast ?? true;
    utxos.sort((a, b) => utxoSortGreatestToLeast ? b.value - a.value : a.value - b.value);
    const concurrencyLimit = 100;
    const results = [];
    const iteratorFn = async (utxo) => {
        try {
            const txIdVout = `${utxo.txid}:${utxo.vout}`;
            const [txOutput, txDetails] = await Promise.all([
                provider.ord.getTxOutput(txIdVout),
                provider.esplora.getTxInfo(utxo.txid),
            ]);
            // Change the UTXO script_pubkey from ASM to hex.
            // We might be able to derive this without making an extra call.
            utxo.script_pubkey = txDetails.vout[utxo.vout].scriptpubkey;
            return { utxo, txOutput };
        }
        catch (error) {
            console.error(`Error processing UTXO ${utxo.txid}:${utxo.vout}`, error);
            return null;
        }
    };
    for await (const result of (0, tiny_async_pool_1.default)(concurrencyLimit, utxos, iteratorFn)) {
        if (result !== null) {
            results.push(result);
        }
    }
    for (const { utxo, txOutput } of results) {
        totalBalance += utxo.value;
        if (txOutput.indexed) {
            const hasInscriptions = txOutput.inscriptions.length > 0;
            const hasRunes = Object.keys(txOutput.runes).length > 0;
            const confirmations = blockCount - utxo.status.block_height;
            if (!hasInscriptions && !hasRunes) {
                spendableUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    scriptPk: utxo.script_pubkey,
                    address: address,
                    inscriptions: [],
                    confirmations,
                });
                spendableTotalBalance += utxo.value;
            }
            if (hasRunes) {
                runeUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    scriptPk: utxo.script_pubkey,
                    address: address,
                    inscriptions: [],
                    confirmations,
                });
            }
            if (hasInscriptions) {
                ordUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    scriptPk: utxo.script_pubkey,
                    address: address,
                    inscriptions: txOutput.inscriptions,
                    confirmations,
                });
            }
        }
        else if (!utxo.status.confirmed) {
            pendingUtxos.push({
                txId: utxo.txid,
                outputIndex: utxo.vout,
                satoshis: utxo.value,
                scriptPk: utxo.script_pubkey,
                address: address,
                inscriptions: [],
                confirmations: 0,
            });
            pendingTotalBalance += utxo.value;
        }
    }
    return {
        spendableTotalBalance,
        spendableUtxos,
        runeUtxos,
        ordUtxos,
        pendingUtxos,
        pendingTotalBalance,
        totalBalance,
    };
};
exports.addressUtxos = addressUtxos;
const accountUtxos = async ({ account, provider, }) => {
    let accountSpendableTotalBalance = 0;
    let accountPendingTotalBalance = 0;
    let accountTotalBalance = 0;
    const accounts = {};
    const addresses = [
        { addressType: 'nativeSegwit', address: account.nativeSegwit.address },
        { addressType: 'nestedSegwit', address: account.nestedSegwit.address },
        { addressType: 'taproot', address: account.taproot.address },
        { addressType: 'legacy', address: account.legacy.address },
    ];
    const utxoPromises = addresses.map(async ({ address, addressType }) => {
        const { spendableTotalBalance, spendableUtxos, runeUtxos, ordUtxos, pendingUtxos, pendingTotalBalance, totalBalance, } = await (0, exports.addressUtxos)({
            address,
            provider,
        });
        accountSpendableTotalBalance += spendableTotalBalance;
        accountPendingTotalBalance += pendingTotalBalance;
        accountTotalBalance += totalBalance;
        accounts[addressType] = {
            spendableTotalBalance,
            spendableUtxos,
            runeUtxos,
            ordUtxos,
            pendingUtxos,
            pendingTotalBalance,
            totalBalance,
        };
    });
    await Promise.all(utxoPromises);
    return {
        accountTotalBalance,
        accountSpendableTotalBalance,
        accountPendingTotalBalance,
        accounts,
    };
};
exports.accountUtxos = accountUtxos;
//# sourceMappingURL=utxo.js.map