"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectUtxos = exports.accountUtxos = exports.addressUtxos = exports.addressBalance = exports.accountBalance = void 0;
const tslib_1 = require("tslib");
const tiny_async_pool_1 = tslib_1.__importDefault(require("tiny-async-pool"));
const utils_1 = require("../shared/utils");
const alkanes_1 = require("../alkanes");
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
        confirmedAmount: Math.floor(confirmedAmount / 10 ** 8),
        pendingAmount: Math.floor(pendingAmount / 10 ** 8),
        amount: Math.floor(amount / 10 ** 8),
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
const mapAlkanesById = (outpoints) => {
    const toBigInt = (hex) => BigInt(hex);
    return outpoints
        .flatMap(({ runes }) => runes)
        .reduce((acc, { rune, balance }) => {
        const key = `${toBigInt(rune.id.block)}:${toBigInt(rune.id.tx)}`;
        const previous = acc[key]?.value ? BigInt(acc[key].value) : 0n;
        acc[key] = {
            value: (previous + toBigInt(balance)).toString(),
            name: rune.name,
            symbol: rune.symbol,
        };
        return acc;
    }, {});
};
const addressUtxos = async ({ address, provider, spendStrategy, }) => {
    let spendableTotalBalance = 0;
    let pendingTotalBalance = 0;
    let totalBalance = 0;
    const spendableUtxos = [];
    const pendingUtxos = [];
    const ordUtxos = [];
    const runeUtxos = [];
    let alkaneUtxos = [];
    const multiCall = await provider.sandshrew.multiCall([
        ['esplora_address::utxo', [address]],
        ['btc_getblockcount', []],
        [
            'alkanes_protorunesbyaddress',
            [
                {
                    address,
                    protocolTag: '1',
                },
            ],
        ],
    ]);
    const utxos = multiCall[0].result;
    const blockCount = multiCall[1].result;
    const alkanesByAddress = multiCall[2].result;
    if (utxos.length === 0) {
        return {
            alkaneUtxos,
            spendableTotalBalance,
            spendableUtxos,
            runeUtxos,
            ordUtxos,
            pendingUtxos,
            pendingTotalBalance,
            totalBalance,
        };
    }
    alkanesByAddress.outpoints.forEach((alkane) => {
        alkane.outpoint.txid = (0, alkanes_1.toTxId)(alkane.outpoint.txid);
    });
    const concurrencyLimit = 50;
    const processedUtxos = [];
    const processUtxo = async (utxo) => {
        try {
            const txIdVout = `${utxo.txid}:${utxo.vout}`;
            const multiCall = await provider.sandshrew.multiCall([
                ['ord_output', [txIdVout]],
                ['esplora_tx', [utxo.txid]],
            ]);
            const txOutput = multiCall[0].result;
            const txDetails = multiCall[1].result;
            const alkanesOutpoints = alkanesByAddress.outpoints.filter(({ outpoint }) => outpoint.txid === utxo.txid && outpoint.vout === utxo.vout);
            return {
                utxo,
                txOutput,
                scriptPk: txDetails.vout[utxo.vout].scriptpubkey,
                alkanesOutpoints,
            };
        }
        catch (error) {
            console.error(`Error processing UTXO ${utxo.txid}:${utxo.vout}`, error);
            throw error;
        }
    };
    for await (const result of (0, tiny_async_pool_1.default)(concurrencyLimit, utxos, processUtxo)) {
        if (result !== null) {
            processedUtxos.push(result);
        }
    }
    const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast ?? true;
    processedUtxos.sort((a, b) => utxoSortGreatestToLeast
        ? b.utxo.value - a.utxo.value
        : a.utxo.value - b.utxo.value);
    for (const { utxo, txOutput, scriptPk, alkanesOutpoints } of processedUtxos) {
        totalBalance += utxo.value;
        if (txOutput.indexed) {
            const hasInscriptions = txOutput.inscriptions.length > 0;
            const hasRunes = Object.keys(txOutput.runes).length > 0;
            const hasAlkanes = alkanesOutpoints.length > 0;
            const confirmations = blockCount - utxo.status.block_height;
            const alkanesById = mapAlkanesById(alkanesOutpoints);
            if (!utxo.status.confirmed) {
                pendingUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    address: address,
                    inscriptions: txOutput.inscriptions,
                    alkanes: alkanesById,
                    confirmations: 0,
                    scriptPk,
                });
                pendingTotalBalance += utxo.value;
                continue;
            }
            if (hasAlkanes) {
                alkaneUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    address: address,
                    inscriptions: txOutput.inscriptions,
                    alkanes: alkanesById,
                    confirmations,
                    scriptPk,
                });
            }
            if (hasRunes) {
                runeUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    address: address,
                    inscriptions: txOutput.inscriptions,
                    alkanes: alkanesById,
                    confirmations,
                    scriptPk,
                });
            }
            if (hasInscriptions) {
                ordUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    address: address,
                    inscriptions: txOutput.inscriptions,
                    alkanes: alkanesById,
                    confirmations,
                    scriptPk,
                });
            }
            if (!hasInscriptions &&
                !hasRunes &&
                !hasAlkanes &&
                utxo.value !== 546 &&
                utxo.value !== 330) {
                spendableUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    address: address,
                    inscriptions: txOutput.inscriptions,
                    alkanes: alkanesById,
                    confirmations,
                    scriptPk,
                });
                spendableTotalBalance += utxo.value;
                continue;
            }
        }
    }
    return {
        alkaneUtxos,
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
    let accountSpendableTotalUtxos = [];
    let accountSpendableTotalBalance = 0;
    let accountPendingTotalBalance = 0;
    let accountTotalBalance = 0;
    const accounts = {};
    const addresses = [
        { addressKey: 'nativeSegwit', address: account.nativeSegwit.address },
        { addressKey: 'nestedSegwit', address: account.nestedSegwit.address },
        { addressKey: 'taproot', address: account.taproot.address },
        { addressKey: 'legacy', address: account.legacy.address },
    ];
    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i].address;
        const addressKey = addresses[i].addressKey;
        const { alkaneUtxos, spendableTotalBalance, spendableUtxos, runeUtxos, ordUtxos, pendingUtxos, pendingTotalBalance, totalBalance, } = await (0, exports.addressUtxos)({
            address,
            provider,
        });
        accountSpendableTotalBalance += spendableTotalBalance;
        accountSpendableTotalUtxos.push(...spendableUtxos);
        accountPendingTotalBalance += pendingTotalBalance;
        accountTotalBalance += totalBalance;
        accounts[addressKey] = {
            alkaneUtxos,
            spendableTotalBalance,
            spendableUtxos,
            runeUtxos,
            ordUtxos,
            pendingUtxos,
            pendingTotalBalance,
            totalBalance,
        };
    }
    return {
        accountTotalBalance,
        accountSpendableTotalUtxos,
        accountSpendableTotalBalance,
        accountPendingTotalBalance,
        accounts,
    };
};
exports.accountUtxos = accountUtxos;
const selectUtxos = (utxos, spendStrategy) => {
    const addressMap = new Map();
    utxos.forEach((utxo) => {
        const addressKey = (0, utils_1.getAddressKey)(utxo.address);
        if (spendStrategy.addressOrder.includes(addressKey)) {
            if (!addressMap.has(addressKey)) {
                addressMap.set(addressKey, []);
            }
            addressMap.get(addressKey).push(utxo);
        }
    });
    return spendStrategy.addressOrder.flatMap((addressKey) => {
        const utxosForAddress = addressMap.get(addressKey) || [];
        return utxosForAddress.sort((a, b) => (spendStrategy.utxoSortGreatestToLeast ? b.satoshis : a.satoshis) -
            (spendStrategy.utxoSortGreatestToLeast ? a.satoshis : b.satoshis));
    });
};
exports.selectUtxos = selectUtxos;
//# sourceMappingURL=utxo.js.map