"use strict";
//spend strategy and utxo strategy
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
exports.findUtxosToCoverAmount = exports.addressSpendableUtxos = exports.accountSpendableUtxos = exports.spendableUtxos = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const transactions_1 = require("../transactions");
const constants_1 = require("../shared/constants");
const spendableUtxos = async (address, provider, spendAmount) => {
    const addressType = (0, transactions_1.getAddressType)(address);
    const utxosResponse = await provider.esplora.getAddressUtxo(address);
    if (!utxosResponse || utxosResponse?.length === 0) {
        return [];
    }
    const formattedUtxos = [];
    let filtered = utxosResponse;
    for (const utxo of filtered) {
        const hasInscription = await provider.ord.getTxOutput(utxo.txid + ':' + utxo.vout);
        let hasRune = false;
        if (provider.network != bitcoin.networks.regtest) {
            hasRune = await provider.api.getOutputRune({
                output: utxo.txid + ':' + utxo.vout,
            });
        }
        if (hasInscription.inscriptions.length === 0 &&
            hasInscription.runes.length === 0 &&
            hasInscription.value !== 546 &&
            !hasRune?.output) {
            const transactionDetails = await provider.esplora.getTxInfo(utxo.txid);
            const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
            if (utxo.status.confirmed) {
                formattedUtxos.push({
                    txId: utxo.txid,
                    outputIndex: utxo.vout,
                    satoshis: utxo.value,
                    confirmations: utxo.status.confirmed ? 3 : 0,
                    scriptPk: voutEntry.scriptpubkey,
                    address: address,
                    inscriptions: [],
                });
            }
        }
    }
    if (formattedUtxos.length === 0) {
        return undefined;
    }
    const sortedUtxos = formattedUtxos.sort((a, b) => b.satoshis - a.satoshis);
    return sortedUtxos;
};
exports.spendableUtxos = spendableUtxos;
const accountSpendableUtxos = async ({ account, provider, spendAmount, }) => {
    let totalAmount = 0;
    let allUtxos = [];
    for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
        const address = account[account.spendStrategy.addressOrder[i]].address;
        const utxoSortGreatestToLeast = account.spendStrategy.utxoSortGreatestToLeast ? account.spendStrategy.utxoSortGreatestToLeast : true;
        const { totalGathered, utxos: formattedUtxos } = await (0, exports.addressSpendableUtxos)({
            address,
            provider,
            spendAmount,
            utxoSortGreatestToLeast
        });
        totalAmount += totalGathered;
        allUtxos = [...allUtxos, ...formattedUtxos];
        if (totalGathered >= spendAmount) {
            return allUtxos;
        }
    }
    throw Error('Insufficient balance');
};
exports.accountSpendableUtxos = accountSpendableUtxos;
const addressSpendableUtxos = async ({ address, provider, spendAmount, utxoSortGreatestToLeast }) => {
    let totalGathered = 0;
    let sortedUtxos = [];
    const formattedUtxos = [];
    const utxos = await provider.esplora.getAddressUtxo(address);
    if (utxoSortGreatestToLeast) {
        sortedUtxos = utxos.sort((a, b) => b.value - a.value);
    }
    else {
        sortedUtxos = utxos.sort((a, b) => a.value - b.value);
    }
    let filteredUtxos = sortedUtxos.filter((utxo) => {
        return (utxo.value > constants_1.UTXO_DUST &&
            utxo.value != 546 &&
            utxo.status.confirmed === true);
    });
    for (let i = 0; i < filteredUtxos.length; i++) {
        if (totalGathered >= spendAmount) {
            return { totalGathered, utxos: formattedUtxos };
        }
        const hasInscription = await provider.ord.getTxOutput(utxos[i].txid + ':' + utxos[i].vout);
        let hasRune = false;
        if (provider.network != bitcoin.networks.regtest) {
            hasRune = await provider.api.getOutputRune({
                output: utxos[i].txid + ':' + utxos[i].vout,
            });
        }
        if (hasInscription.inscriptions.length === 0 &&
            hasInscription.runes.length === 0 &&
            hasInscription.value !== 546 &&
            !hasRune?.output) {
            const transactionDetails = await provider.esplora.getTxInfo(utxos[i].txid);
            const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
            if (utxos[i].status.confirmed) {
                formattedUtxos.push({
                    txId: utxos[i].txid,
                    outputIndex: utxos[i].vout,
                    satoshis: utxos[i].value,
                    confirmations: utxos[i].status.confirmed ? 3 : 0,
                    scriptPk: voutEntry.scriptpubkey,
                    address: address,
                    inscriptions: [],
                });
                totalGathered += utxos[i].value;
            }
        }
    }
    return { totalGathered, utxos: formattedUtxos };
};
exports.addressSpendableUtxos = addressSpendableUtxos;
function findUtxosToCoverAmount(utxos, amount) {
    if (!utxos || utxos?.length === 0) {
        return undefined;
    }
    let totalSatoshis = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
        if (totalSatoshis >= amount)
            break;
        selectedUtxos.push(utxo);
        totalSatoshis += utxo.satoshis;
    }
    if (totalSatoshis >= amount) {
        return {
            selectedUtxos,
            totalSatoshis,
            change: totalSatoshis - amount,
        };
    }
    else {
        return undefined;
    }
}
exports.findUtxosToCoverAmount = findUtxosToCoverAmount;
//# sourceMappingURL=index.js.map