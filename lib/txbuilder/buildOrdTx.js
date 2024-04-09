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
Object.defineProperty(exports, "__esModule", { value: true });
exports.usableUtxo = exports.findUtxosToCoverAmount = exports.findUtxosForFees = exports.addInscriptionUtxo = exports.getUtxosForFees = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const transactions_1 = require("../transactions");
const utils_1 = require("../shared/utils");
const getUtxosForFees = async ({ payFeesWithSegwit, psbtTx, feeRate, taprootUtxos, taprootAddress, inscription, segwitUtxos, segwitAddress, segwitPubKey, utxosToSend, network, fromAddress, }) => {
    return await addSegwitFeeUtxo({
        taprootUtxos: taprootUtxos,
        segwitUtxos: segwitUtxos,
        feeRate: feeRate,
        psbtTx: psbtTx,
        segwitAddress: segwitAddress,
        segwitPubKey: segwitPubKey,
        utxosToSend: utxosToSend,
        taprootAddress: taprootAddress,
        inscription: inscription,
        network,
        payFeesWithSegwit: payFeesWithSegwit,
        fromAddress: fromAddress,
    });
};
exports.getUtxosForFees = getUtxosForFees;
const addSegwitFeeUtxo = async ({ segwitUtxos, feeRate, psbtTx, segwitAddress, segwitPubKey, utxosToSend, taprootUtxos, taprootAddress, inscription, network, payFeesWithSegwit, fromAddress, }) => {
    const nonMetaTaprootUtxos = await (0, utils_1.filterTaprootUtxos)({
        taprootUtxos: taprootUtxos,
    });
    const inputCount = psbtTx.txInputs.length === 0 ? 1 : psbtTx.txInputs.length;
    const vB = inputCount * 1 * 149 + 3 * 32 + 12;
    const fee = vB * feeRate;
    const addressType = (0, transactions_1.getAddressType)(segwitAddress);
    let redeemScript;
    if (addressType === 2) {
        const p2wpkh = bitcoin.payments.p2wpkh({
            pubkey: Buffer.from(segwitPubKey, 'hex'),
            network: network,
        });
        redeemScript = p2wpkh.output;
    }
    if (addressType === 3) {
        const p2wpkh = bitcoin.payments.p2wpkh({
            pubkey: Buffer.from(segwitPubKey, 'hex'),
            network: network,
        });
        const p2sh = bitcoin.payments.p2sh({
            redeem: p2wpkh,
            network: network,
        });
        redeemScript = p2sh.redeem.output;
    }
    if (utxosToSend) {
        let feeUtxos = payFeesWithSegwit
            ? findUtxosForFees(segwitUtxos, fee)
            : findUtxosForFees(nonMetaTaprootUtxos, fee);
        if (utxosToSend?.change) {
            if (utxosToSend.change - fee >= 0) {
                return psbtTx.addOutput({
                    address: fromAddress,
                    value: Math.floor(utxosToSend.change - fee),
                });
            }
            else {
                feeUtxos = payFeesWithSegwit
                    ? findUtxosForFees(segwitUtxos, fee - utxosToSend.change)
                    : findUtxosForFees(nonMetaTaprootUtxos, fee - utxosToSend.change);
            }
        }
        if (!feeUtxos) {
            return await addTaprootFeeUtxo({
                taprootUtxos: taprootUtxos,
                feeRate: feeRate,
                psbtTx: psbtTx,
                taprootAddress: taprootAddress,
                utxosToSend: utxosToSend,
            });
        }
        for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
            if ((0, exports.usableUtxo)(feeUtxos.selectedUtxos[i], utxosToSend?.selectedUtxos) &&
                confirmedUtxo(feeUtxos.selectedUtxos[i])) {
                if (addressType === 2) {
                    psbtTx.addInput({
                        hash: feeUtxos.selectedUtxos[i].txId,
                        index: feeUtxos.selectedUtxos[i].outputIndex,
                        witnessUtxo: {
                            value: feeUtxos.selectedUtxos[i].satoshis,
                            script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
                        },
                        redeemScript: redeemScript,
                    });
                }
                else {
                    psbtTx.addInput({
                        hash: feeUtxos.selectedUtxos[i].txId,
                        index: feeUtxos.selectedUtxos[i].outputIndex,
                        witnessUtxo: {
                            value: feeUtxos.selectedUtxos[i].satoshis,
                            script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
                        },
                    });
                }
            }
            else {
                return;
            }
        }
        psbtTx.addOutput({
            address: payFeesWithSegwit ? segwitAddress : taprootAddress,
            value: Math.floor(feeUtxos.change),
        });
        return;
    }
    else {
        let amountForFee = fee;
        if (inscription['isInscription']) {
            amountForFee = 2 * fee + 546;
        }
        const feeUtxos = payFeesWithSegwit
            ? findUtxosForFees(segwitUtxos, amountForFee)
            : findUtxosForFees(nonMetaTaprootUtxos, amountForFee);
        if (!feeUtxos) {
            return await addTaprootFeeUtxo({
                taprootUtxos: taprootUtxos,
                feeRate: feeRate,
                psbtTx: psbtTx,
                taprootAddress: taprootAddress,
                utxosToSend: utxosToSend,
            });
        }
        for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
            if ((0, exports.usableUtxo)(feeUtxos.selectedUtxos[i], utxosToSend?.selectedUtxos) &&
                confirmedUtxo(feeUtxos.selectedUtxos[i])) {
                if (addressType === 2) {
                    psbtTx.addInput({
                        hash: feeUtxos.selectedUtxos[i].txId,
                        index: feeUtxos.selectedUtxos[i].outputIndex,
                        witnessUtxo: {
                            value: feeUtxos.selectedUtxos[i].satoshis,
                            script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
                        },
                        redeemScript: redeemScript,
                    });
                }
                else {
                    psbtTx.addInput({
                        hash: feeUtxos.selectedUtxos[i].txId,
                        index: feeUtxos.selectedUtxos[i].outputIndex,
                        witnessUtxo: {
                            value: feeUtxos.selectedUtxos[i].satoshis,
                            script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
                        },
                    });
                }
            }
        }
        psbtTx.addOutput({
            address: payFeesWithSegwit ? segwitAddress : taprootAddress,
            value: Math.floor(feeUtxos.change),
        });
        psbtTx.addOutput({
            address: inscription['inscriberAddress'],
            value: Math.floor(fee),
        });
    }
};
const addTaprootFeeUtxo = async ({ taprootUtxos, feeRate, psbtTx, taprootAddress, utxosToSend, inscription, }) => {
    const nonMetaTaprootUtxos = await (0, utils_1.filterTaprootUtxos)({
        taprootUtxos: taprootUtxos,
    });
    nonMetaTaprootUtxos.sort((a, b) => b.satoshis - a.satoshis);
    const inputCount = psbtTx.txInputs.length === 0 ? 1 : psbtTx.txInputs.length;
    const vB = inputCount * 149 + 3 * 32 + 12;
    const fee = vB * feeRate;
    let amountForFee = fee;
    if (inscription['isInscription']) {
        amountForFee = 2 * fee + 546;
    }
    const feeUtxos = findUtxosForFees(nonMetaTaprootUtxos, amountForFee);
    if (!feeUtxos) {
        throw new Error('No available UTXOs');
    }
    for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
        if ((0, exports.usableUtxo)(feeUtxos.selectedUtxos[i], utxosToSend.selectedUtxos) &&
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
};
const addInscriptionUtxo = async ({ metaUtxos, inscriptionId, toAddress, psbtTx, }) => {
    const matchedUtxo = metaUtxos.find((utxo) => {
        return utxo.inscriptions.some((inscription) => inscription.collectibles.id === inscriptionId);
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
};
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
function findUtxosToCoverAmount(utxos, amount) {
    if (!utxos || utxos.length === 0) {
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
const usableUtxo = (feeUtxo, utxosToSend) => {
    if (!utxosToSend) {
        return true;
    }
    for (let j = 0; j < utxosToSend.length; j++) {
        if (feeUtxo.txId === utxosToSend[j].txId)
            return false;
    }
    return true;
};
exports.usableUtxo = usableUtxo;
const confirmedUtxo = (feeUtxo) => {
    return feeUtxo.confirmations > 0;
};
//# sourceMappingURL=buildOrdTx.js.map