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
exports.findUtxosToCoverAmount = exports.accountSpendableUtxos = exports.addressSpendableUtxos = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const constants_1 = require("../shared/constants");
const addressSpendableUtxos = async ({ address, provider, spendAmount, spendStrategy }) => {
    let totalAmount = 0;
    let sortedUtxos = [];
    const formattedUtxos = [];
    const utxos = await provider.esplora.getAddressUtxo(address);
    const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast !== undefined
        ? spendStrategy.utxoSortGreatestToLeast
        : true;
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
        if (spendAmount && totalAmount >= spendAmount) {
            return { totalAmount, utxos: formattedUtxos };
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
                totalAmount += utxos[i].value;
            }
        }
    }
    return { totalAmount, utxos: formattedUtxos };
};
exports.addressSpendableUtxos = addressSpendableUtxos;
const accountSpendableUtxos = async ({ account, provider, spendAmount, }) => {
    let totalAmount = 0;
    let allUtxos = [];
    for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
        const address = account[account.spendStrategy.addressOrder[i]].address;
        const { totalAmount: addressTotal, utxos: formattedUtxos } = await (0, exports.addressSpendableUtxos)({
            address,
            provider,
            spendAmount,
            spendStrategy: account.spendStrategy
        });
        totalAmount += addressTotal;
        allUtxos = [...allUtxos, ...formattedUtxos];
        if (spendAmount && totalAmount >= spendAmount) {
            return { totalAmount, utxos: allUtxos };
        }
    }
    return { totalAmount, utxos: allUtxos };
};
exports.accountSpendableUtxos = accountSpendableUtxos;
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