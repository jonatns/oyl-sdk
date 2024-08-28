"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountUtxos = exports.addressUtxos = exports.accountBalance = exports.accountSpendableUtxos = exports.addressSpendableUtxos = exports.availableBalance = void 0;
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
const accountBalance = async ({ account, provider, }) => {
    let balance = 0;
    let pendingBalance = 0;
    for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
        const address = account[account.spendStrategy.addressOrder[i]].address;
        const { spendableTotalBalance, pendingTotalBalance } = await (0, exports.addressUtxos)({
            address,
            provider,
            spendStrategy: account.spendStrategy,
        });
        balance += spendableTotalBalance;
        pendingBalance += pendingTotalBalance;
    }
    return { balance, pendingBalance };
};
exports.accountBalance = accountBalance;
const addressUtxos = async ({ address, provider, spendStrategy, }) => {
    let spendableTotalBalance = 0;
    let pendingTotalBalance = 0;
    let totalBalance = 0;
    const spendableUtxos = [];
    const pendingUtxos = [];
    const ordUtxos = [];
    const runeUtxos = [];
    let multiCall = await provider.sandshrew.multiCall([
        ['esplora_address::utxo', [address]],
        ['btc_getblockcount', []],
    ]);
    let blockCount = multiCall[1].result;
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
    utxos = utxos
        .filter((utxo) => utxo.value >= constants_1.UTXO_DUST)
        .sort((a, b) => utxoSortGreatestToLeast ? b.value - a.value : a.value - b.value);
    const utxoPromises = utxos.map(async (utxo) => {
        const outputId = `${utxo.txid}:${utxo.vout}`;
        const [hasInscription, hasRune] = await Promise.all([
            provider.ord.getTxOutput(outputId),
            provider.network.bech32 !== bitcoin.networks.regtest.bech32
                ? provider.api.getOutputRune({ output: outputId })
                : Promise.resolve(false),
        ]);
        return { utxo, hasInscription, hasRune };
    });
    const results = await Promise.all(utxoPromises);
    for (const { utxo, hasInscription, hasRune } of results) {
        if (hasInscription.inscriptions.length === 0 &&
            hasInscription.runes.length === 0 &&
            hasInscription.indexed &&
            hasInscription.value !== 546 &&
            !hasRune?.output) {
            const transactionDetails = await provider.esplora.getTxInfo(utxo.txid);
            const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
            spendableUtxos.push({
                txId: utxo.txid,
                outputIndex: utxo.vout,
                satoshis: utxo.value,
                confirmations: utxo.status.confirmed
                    ? blockCount - utxo.status.block_height
                    : 0,
                scriptPk: voutEntry.scriptpubkey,
                address: address,
                inscriptions: [],
            });
            spendableTotalBalance += utxo.value;
            totalBalance += utxo.value;
        }
        if (hasRune?.output || hasInscription.runes.length > 0) {
            const transactionDetails = await provider.esplora.getTxInfo(utxo.txid);
            const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
            runeUtxos.push({
                txId: utxo.txid,
                outputIndex: utxo.vout,
                satoshis: utxo.value,
                confirmations: utxo.status.confirmed
                    ? blockCount - utxo.status.block_height
                    : 0,
                scriptPk: voutEntry.scriptpubkey,
                address: address,
                inscriptions: [],
            });
            totalBalance += utxo.value;
        }
        if (hasInscription.indexed &&
            hasInscription.inscriptions.length > 0 &&
            !hasRune?.output) {
            const transactionDetails = await provider.esplora.getTxInfo(utxo.txid);
            const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
            ordUtxos.push({
                txId: utxo.txid,
                outputIndex: utxo.vout,
                satoshis: utxo.value,
                confirmations: utxo.status.confirmed
                    ? blockCount - utxo.status.block_height
                    : 0,
                scriptPk: voutEntry.scriptpubkey,
                address: address,
                inscriptions: hasInscription.inscriptions,
            });
            totalBalance += utxo.value;
        }
        if (!hasInscription.indexed && !utxo.status.confirmed) {
            const transactionDetails = await provider.esplora.getTxInfo(utxo.txid);
            const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
            pendingUtxos.push({
                txId: utxo.txid,
                outputIndex: utxo.vout,
                satoshis: utxo.value,
                confirmations: utxo.status.confirmed
                    ? blockCount - utxo.status.block_height
                    : 0,
                scriptPk: voutEntry.scriptpubkey,
                address: address,
                inscriptions: [],
            });
            pendingTotalBalance += utxo.value;
            totalBalance += utxo.value;
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
    const accounts = [];
    for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
        const address = account[account.spendStrategy.addressOrder[i]].address;
        const addressType = account.spendStrategy.addressOrder[i];
        const { spendableTotalBalance, spendableUtxos, runeUtxos, ordUtxos, pendingUtxos, pendingTotalBalance, totalBalance, } = await (0, exports.addressUtxos)({
            address,
            provider,
            spendStrategy: account.spendStrategy,
        });
        accountSpendableTotalBalance += spendableTotalBalance;
        accountPendingTotalBalance += pendingTotalBalance;
        accountTotalBalance += totalBalance;
        accounts.push({
            [addressType]: {
                spendableTotalBalance,
                spendableUtxos,
                runeUtxos,
                ordUtxos,
                pendingUtxos,
                pendingTotalBalance,
                totalBalance,
            },
        });
    }
    return {
        accountTotalBalance,
        accountSpendableTotalBalance,
        accountPendingTotalBalance,
        accounts,
    };
};
exports.accountUtxos = accountUtxos;
//# sourceMappingURL=utxo.js.map