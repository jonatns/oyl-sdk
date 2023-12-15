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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUtxosForFees = exports.addInscriptionUtxo = exports.getUtxosForFees = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const transactions_1 = require("../transactions");
const getUtxosForFees = ({ payFeesWithSegwit, psbtTx, feeRate, taprootUtxos, taprootAddress, segwitUtxos, segwitAddress, segwitPubKey, utxosToSend, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield addSegwitFeeUtxo({
            taprootUtxos: taprootUtxos,
            segwitUtxos: segwitUtxos,
            feeRate: feeRate,
            psbtTx: psbtTx,
            segwitAddress: segwitAddress,
            segwitPubKey: segwitPubKey,
            utxosToSend: utxosToSend,
            taprootAddress: taprootAddress,
        });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getUtxosForFees = getUtxosForFees;
const addSegwitFeeUtxo = ({ segwitUtxos, feeRate, psbtTx, segwitAddress, segwitPubKey, utxosToSend, taprootUtxos, taprootAddress, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nonMetaSegwitUtxos } = segwitUtxos.reduce((acc, utxo) => {
            utxo.inscriptions.length > 0
                ? acc.metaUtxos.push(utxo)
                : acc.nonMetaSegwitUtxos.push(utxo);
            return acc;
        }, { metaUtxos: [], nonMetaSegwitUtxos: [] });
        nonMetaSegwitUtxos.sort((a, b) => b.satoshis - a.satoshis);
        const inputCount = psbtTx.txInputs.length === 0 ? 1 : psbtTx.txInputs.length;
        const vB = inputCount * 1 * 149 + 3 * 32 + 12;
        const fee = vB * feeRate;
        const feeUtxos = findUtxosForFees(nonMetaSegwitUtxos, fee);
        if (!feeUtxos) {
            try {
                yield addTaprootFeeUtxo({
                    taprootUtxos: taprootUtxos,
                    feeRate: feeRate,
                    psbtTx: psbtTx,
                    taprootAddress: taprootAddress,
                    utxosToSend: utxosToSend,
                });
                return;
            }
            catch (error) {
                throw new Error('No available UTXOs to pay for fees');
            }
        }
        const addressType = (0, transactions_1.getAddressType)(segwitAddress);
        let redeemScript;
        if (addressType === 1) {
            const p2shObj = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2sh({
                    pubkey: Buffer.from(segwitPubKey, 'hex'),
                    network: bitcoin.networks.bitcoin,
                }),
            });
            redeemScript = p2shObj.redeem.output;
        }
        if (addressType === 2) {
            try {
                const p2wpkh = bitcoin.payments.p2wpkh({
                    pubkey: Buffer.from(segwitPubKey, 'hex'),
                    network: bitcoin.networks.bitcoin,
                });
                const p2sh = bitcoin.payments.p2sh({
                    redeem: p2wpkh,
                    network: bitcoin.networks.bitcoin,
                });
                redeemScript = p2sh.redeem.output;
            }
            catch (error) {
                console.log(error);
            }
        }
        for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
            if (yield usableUtxo(feeUtxos.selectedUtxos[i], utxosToSend)) {
                psbtTx.addInput({
                    hash: feeUtxos.selectedUtxos[i].txId,
                    index: feeUtxos.selectedUtxos[i].outputIndex,
                    witnessUtxo: {
                        value: feeUtxos.selectedUtxos[i].satoshis,
                        script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
                    },
                    redeemScript: redeemScript,
                });
                psbtTx.addOutput({
                    address: segwitAddress,
                    value: Math.floor(feeUtxos.change),
                });
            }
            return;
        }
    }
    catch (e) {
        console.error(e);
        return;
    }
});
const addTaprootFeeUtxo = ({ taprootUtxos, feeRate, psbtTx, taprootAddress, utxosToSend, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { nonMetaTaprootUtxos } = taprootUtxos.reduce((acc, utxo) => {
        utxo.inscriptions.length > 0 || utxo.satoshis === 546
            ? acc.metaUtxos.push(utxo)
            : acc.nonMetaTaprootUtxos.push(utxo);
        return acc;
    }, { metaUtxos: [], nonMetaTaprootUtxos: [] });
    nonMetaTaprootUtxos.sort((a, b) => b.satoshis - a.satoshis);
    const inputCount = psbtTx.txInputs.length === 0 ? 1 : psbtTx.txInputs.length;
    const vB = inputCount * 149 + 3 * 32 + 12;
    const fee = vB * feeRate;
    const feeUtxos = findUtxosForFees(nonMetaTaprootUtxos, fee);
    if (!feeUtxos) {
        throw new Error('No available UTXOs');
    }
    for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
        if ((yield usableUtxo(feeUtxos.selectedUtxos[i], utxosToSend)) &&
            confirmedUtxo(feeUtxos.selectedUtxos[i])) {
            psbtTx.addInput({
                hash: feeUtxos.selectedUtxos[i].txId,
                index: feeUtxos.selectedUtxos[i].outputIndex,
                witnessUtxo: {
                    value: feeUtxos.selectedUtxos[i].satoshis,
                    script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
                },
            });
            psbtTx.addOutput({
                address: taprootAddress,
                value: Math.floor(feeUtxos.change),
            });
        }
        return;
    }
});
const addInscriptionUtxo = ({ metaUtxos, inscriptionId, toAddress, psbtTx, }) => __awaiter(void 0, void 0, void 0, function* () {
    const matchedUtxo = metaUtxos.find((utxo) => {
        return utxo.inscriptions.some((inscription) => inscription.id === inscriptionId);
    });
    if (!matchedUtxo || matchedUtxo.inscriptions.length > 1) {
        throw new Error(matchedUtxo
            ? 'Multiple inscriptions! Please split first.'
            : 'Inscription not detected.');
    }
    psbtTx.addInput({
        hash: matchedUtxo.txId,
        index: matchedUtxo.outputIndex,
        witnessUtxo: {
            value: matchedUtxo.satoshis,
            script: Buffer.from(matchedUtxo.scriptPk, 'hex'),
        },
    });
    psbtTx.addOutput({
        address: toAddress,
        value: Math.floor(matchedUtxo.satoshis),
    });
    return matchedUtxo;
});
exports.addInscriptionUtxo = addInscriptionUtxo;
function findUtxosForFees(utxos, amount) {
    let totalSatoshis = 0;
    const selectedUtxos = [];
    for (const utxo of utxos) {
        if (totalSatoshis >= amount)
            break;
        if (utxo.confirmations <= 0)
            continue;
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
        return null;
    }
}
exports.findUtxosForFees = findUtxosForFees;
const usableUtxo = (feeUtxo, utxosToSend) => __awaiter(void 0, void 0, void 0, function* () {
    if (!utxosToSend) {
        return true;
    }
    for (let j = 0; j < utxosToSend.length; j++) {
        if (feeUtxo.txId === utxosToSend[j].txId)
            return false;
    }
});
const confirmedUtxo = (feeUtxo) => {
    return feeUtxo.confirmations > 0;
};
//# sourceMappingURL=buildOrdTx.js.map