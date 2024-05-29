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
exports.findUtxosToCoverAmount = exports.oylSpendableUtxos = exports.spendableUtxos = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const transactions_1 = require("../transactions");
const spendableUtxos = async (address, provider) => {
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
const oylSpendableUtxos = async ({ accounts, provider, spendAmount, }) => {
    let totalGathered = 0;
    let allUtxos = [];
    for (let i = 0; i < accounts.spendStrategy.addressOrder.length; i++) {
        const address = accounts[accounts.spendStrategy.addressOrder[i]].address;
        const utxos = await provider.esplora.getAddressUtxo(address);
        const gatheredUtxos = await gatherSpendAmountOfSatoshis({
            provider,
            address: address,
            utxos,
            spendAmount,
        });
        totalGathered += gatheredUtxos.totalGathered;
        allUtxos = [...allUtxos, ...gatheredUtxos.formattedUtxos];
        if (gatheredUtxos.totalGathered >= spendAmount) {
            if (accounts.spendStrategy.utxoSortGreatestToLeast) {
                allUtxos = allUtxos.sort((a, b) => b.satoshis - a.satoshis);
            }
            if (!accounts.spendStrategy.utxoSortGreatestToLeast) {
                allUtxos = allUtxos.sort((a, b) => a.satoshis - b.satoshis);
            }
            return allUtxos;
        }
    }
    throw Error('Insuffiecient balance');
};
exports.oylSpendableUtxos = oylSpendableUtxos;
const gatherSpendAmountOfSatoshis = async ({ spendAmount, provider, utxos, address, }) => {
    const formattedUtxos = [];
    let totalGathered = 0;
    for (let i = 0; i < utxos.length; i++) {
        if (totalGathered >= spendAmount) {
            return { totalGathered: totalGathered, formattedUtxos: formattedUtxos };
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
    return { totalGathered: totalGathered, formattedUtxos: formattedUtxos };
};
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