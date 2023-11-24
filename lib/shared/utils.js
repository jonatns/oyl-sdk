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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScriptForAddress = exports.calculateAmountGathered = exports.getUTXOByAddressTxIDAndVOut = exports.getTheOtherUTXOsToCoverAmount = exports.getUTXOsToCoverAmountWithRemainder = exports.getUTXOsToCoverAmount = exports.getInscriptionsByWalletBIS = exports.getUnspentsForAddressInOrderByValue = exports.getSatpointFromUtxo = exports.getUTXOWorthGreatestValueForAddress = exports.getUnspentsWithConfirmationsForAddress = exports.getWitnessDataChunk = exports.utxoToInput = exports.validator = exports.amountToSatoshis = exports.delay = exports.satoshisToAmount = exports.tweakSigner = exports.assertHex = exports.ECPair = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ecpair_1 = __importDefault(require("ecpair"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
bitcoin.initEccLib(secp256k1_1.default);
const interface_1 = require("../shared/interface");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const constants_1 = require("./constants");
const axios_1 = __importDefault(require("axios"));
const transactions_1 = require("../transactions");
exports.ECPair = (0, ecpair_1.default)(secp256k1_1.default);
const assertHex = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
exports.assertHex = assertHex;
function tapTweakHash(pubKey, h) {
    return bitcoin.crypto.taggedHash('TapTweak', Buffer.concat(h ? [pubKey, h] : [pubKey]));
}
function tweakSigner(signer, opts = {}) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey = signer.privateKey;
    if (!privateKey) {
        throw new Error('Private key required');
    }
    if (signer.publicKey[0] === 3) {
        privateKey = secp256k1_1.default.privateNegate(privateKey);
    }
    const tweakedPrivateKey = secp256k1_1.default.privateAdd(privateKey, tapTweakHash((0, exports.assertHex)(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error('Invalid tweaked private key!');
    }
    return exports.ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}
exports.tweakSigner = tweakSigner;
function satoshisToAmount(val) {
    const num = new bignumber_js_1.default(val);
    return num.dividedBy(100000000).toFixed(8);
}
exports.satoshisToAmount = satoshisToAmount;
// export const inscribe = async ({
//   ticker,
//   amount,
//   inputAddress,
//   outputAddress,
//   commitTxId,
//   isDry,
// }: {
//   ticker: string
//   amount: number
//   inputAddress: string
//   outputAddress: string
//   commitTxId?: string
//   isDry?: boolean
// }) => {
//   const { fastestFee } = await getRecommendedBTCFeesMempool()
//   const inputs = 1
//   const vB = inputs * 149 + 3 * 32 + 12
//   const minerFee = vB * fastestFee
//   const fees = minerFee + 4000
//   console.log(fees)
//   try {
//     const secret =
//       'd84d671cbd24a08db5ed43b93102484bd9bd8beb657e784451a226cf6a6e259b'
//     const secKey = ecc.keys.get_seckey(String(secret))
//     const pubKey = ecc.keys.get_pubkey(String(secret), true)
//     const content = `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amount}"}`
//     const script = createInscriptionScript(pubKey, content)
//     const tapleaf = Tap.encodeScript(script)
//     const [tpubkey, cblock] = Tap.getPubKey(pubKey, { target: tapleaf })
//     const address = Address.p2tr.fromPubKey(tpubkey)
//     let utxosGathered
//     if (!commitTxId) {
//       let reimbursementAmount = 0
//       const psbt = new bitcoin.Psbt()
//       utxosGathered = await getUTXOsToCoverAmountWithRemainder(
//         inputAddress,
//         fees
//       )
//       const amountGathered = calculateAmountGathered(utxosGathered)
//       console.log(amountGathered)
//       if (amountGathered < fees) {
//         console.log('WAHAHAHAHAH')
//         return { error: 'insuffICIENT funds for inscribe' }
//       }
//       reimbursementAmount = amountGathered - fees
//       for await (let utxo of utxosGathered) {
//         const {
//           tx_hash_big_endian,
//           tx_output_n,
//           value,
//           script: outputScript,
//         } = utxo
//         psbt.addInput({
//           hash: tx_hash_big_endian,
//           index: tx_output_n,
//           witnessUtxo: { value, script: Buffer.from(outputScript, 'hex') },
//         })
//       }
//       psbt.addOutput({
//         value: INSCRIPTION_PREPARE_SAT_AMOUNT,
//         address: address, // address for inscriber for the user
//       })
//       if (reimbursementAmount > 546) {
//         psbt.addOutput({
//           value: reimbursementAmount,
//           address: inputAddress,
//         })
//       }
//       return {
//         psbtHex: psbt.toHex(),
//         psbtBase64: psbt.toBase64(),
//         utxosGathered,
//       }
//     }
//     const txData = Tx.create({
//       vin: [
//         {
//           txid: commitTxId,
//           vout: 0,
//           prevout: {
//             value: INSCRIPTION_PREPARE_SAT_AMOUNT,
//             scriptPubKey: ['OP_1', tpubkey],
//           },
//         },
//       ],
//       vout: [
//         {
//           value: 546,
//           scriptPubKey: Address.toScriptPubKey(outputAddress),
//         },
//       ],
//     })
//     const sig = Signer.taproot.sign(secKey, txData, 0, { extension: tapleaf })
//     txData.vin[0].witness = [sig, script, cblock]
//     if (!isDry) {
//       return await callBTCRPCEndpoint(
//         'sendrawtransaction',
//         Tx.encode(txData).hex
//       )
//     } else {
//       return { result: Tx.util.getTxid(txData) }
//     }
//   } catch (e: any) {
//     // console.error(e);
//     return { error: e.message }
//   }
// }
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
function amountToSatoshis(val) {
    const num = new bignumber_js_1.default(val);
    return num.multipliedBy(100000000).toNumber();
}
exports.amountToSatoshis = amountToSatoshis;
const validator = (pubkey, msghash, signature) => exports.ECPair.fromPublicKey(pubkey).verify(msghash, signature);
exports.validator = validator;
function utxoToInput(utxo, publicKey) {
    let data;
    console.log(utxo);
    switch (utxo.addressType) {
        case interface_1.AddressType.P2TR:
            data = {
                hash: utxo.txId,
                index: utxo.outputIndex,
                witnessUtxo: {
                    value: utxo.satoshis,
                    script: Buffer.from(utxo.scriptPk, 'hex'),
                },
                tapInternalKey: (0, exports.assertHex)(publicKey),
            };
            return {
                data,
                utxo,
            };
        case interface_1.AddressType.P2WPKH:
            data = {
                hash: utxo.txId,
                index: utxo.outputIndex,
                witnessUtxo: {
                    value: utxo.satoshis,
                    script: Buffer.from(utxo.scriptPk, 'hex'),
                },
            };
            return {
                data,
                utxo,
            };
        case interface_1.AddressType.P2PKH:
            data = {
                hash: utxo.txId,
                index: utxo.outputIndex,
                witnessUtxo: {
                    value: utxo.satoshis,
                    script: Buffer.from(utxo.scriptPk, 'hex'),
                },
            };
            return {
                data,
                utxo,
            };
        case interface_1.AddressType.P2SH_P2WPKH:
            const redeemData = bitcoin.payments.p2wpkh({ pubkey: publicKey });
            data = {
                hash: utxo.txId,
                index: utxo.outputIndex,
                witnessUtxo: {
                    value: utxo.satoshis,
                    script: Buffer.from(utxo.scriptPk, 'hex'),
                },
                redeemScript: redeemData.output,
            };
            return {
                data,
                utxo,
            };
        default:
            data = {
                hash: '',
                index: 0,
                witnessUtxo: {
                    value: 0,
                    script: Buffer.from(utxo.scriptPk, 'hex'),
                },
            };
            return {
                data,
                utxo,
            };
    }
}
exports.utxoToInput = utxoToInput;
const getWitnessDataChunk = function (content, encodeType = 'utf8') {
    const buffered = Buffer.from(content, encodeType);
    const contentChunks = [];
    let chunks = 0;
    while (chunks < buffered.byteLength) {
        const split = buffered.subarray(chunks, chunks + constants_1.maximumScriptBytes);
        chunks += split.byteLength;
        contentChunks.push(split);
    }
    return contentChunks;
};
exports.getWitnessDataChunk = getWitnessDataChunk;
const getUnspentsWithConfirmationsForAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, transactions_1.getUnspentOutputs)(address).then((unspents) => unspents === null || unspents === void 0 ? void 0 : unspents.unspent_outputs.filter((utxo) => utxo.confirmations >= 0));
    }
    catch (e) {
        throw new Error(e);
    }
});
exports.getUnspentsWithConfirmationsForAddress = getUnspentsWithConfirmationsForAddress;
const getUTXOWorthGreatestValueForAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const unspents = yield (0, exports.getUnspentsWithConfirmationsForAddress)(address);
    return unspents.reduce(function (prev, current) {
        return prev.value > current.value ? prev : current;
    });
});
exports.getUTXOWorthGreatestValueForAddress = getUTXOWorthGreatestValueForAddress;
const getSatpointFromUtxo = (utxo) => {
    return `${utxo.tx_hash_big_endian}:${utxo.tx_output_n}:0`;
};
exports.getSatpointFromUtxo = getSatpointFromUtxo;
const getUnspentsForAddressInOrderByValue = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const unspents = yield (0, exports.getUnspentsWithConfirmationsForAddress)(address);
    return unspents.sort((a, b) => b.value - a.value);
});
exports.getUnspentsForAddressInOrderByValue = getUnspentsForAddressInOrderByValue;
const getInscriptionsByWalletBIS = (walletAddress, offset = 0) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield axios_1.default
        .get(`https://api.bestinslot.xyz/v3/wallet/inscriptions?address=${walletAddress}&sort_by=inscr_num&order=asc&offset=${offset}&count=100`, {
        headers: {
            'X-Api-Key': 'abbfff3d-49fa-4f7f-883a-0a5fce48a9f1',
        },
    })
        .then((res) => { var _a; return (_a = res.data) === null || _a === void 0 ? void 0 : _a.data; }));
});
exports.getInscriptionsByWalletBIS = getInscriptionsByWalletBIS;
const getUTXOsToCoverAmount = (address, amountNeeded, inscriptionLocs, usedUtxos) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const unspentsOrderedByValue = yield (0, exports.getUnspentsForAddressInOrderByValue)(address);
    const retrievedIxs = yield (0, exports.getInscriptionsByWalletBIS)(address);
    const bisInscriptionLocs = retrievedIxs.map((utxo) => utxo.satpoint);
    if (bisInscriptionLocs.length === 0) {
        inscriptionLocs = [];
    }
    else {
        inscriptionLocs = bisInscriptionLocs;
    }
    let sum = 0;
    const result = [];
    try {
        for (var _d = true, unspentsOrderedByValue_1 = __asyncValues(unspentsOrderedByValue), unspentsOrderedByValue_1_1; unspentsOrderedByValue_1_1 = yield unspentsOrderedByValue_1.next(), _a = unspentsOrderedByValue_1_1.done, !_a;) {
            _c = unspentsOrderedByValue_1_1.value;
            _d = false;
            try {
                let utxo = _c;
                const currentUTXO = utxo;
                const utxoSatpoint = (0, exports.getSatpointFromUtxo)(currentUTXO);
                if ((inscriptionLocs &&
                    (inscriptionLocs === null || inscriptionLocs === void 0 ? void 0 : inscriptionLocs.find((utxoLoc) => utxoLoc === utxoSatpoint))) ||
                    currentUTXO.value <= 546) {
                    continue;
                }
                if ((usedUtxos &&
                    (usedUtxos === null || usedUtxos === void 0 ? void 0 : usedUtxos.find((utxoLoc) => utxo.tx_hash_big_endian === utxoLoc.tx_hash_big_endian &&
                        utxo.tx_output_n === utxoLoc.tx_output_n))) ||
                    currentUTXO.value <= 546) {
                    console.log('SKIPPIN!!!!!!!');
                    continue;
                }
                sum += currentUTXO.value;
                result.push(currentUTXO);
                if (sum > amountNeeded) {
                    console.log('AMOUNT RETRIEVED: ', sum);
                    return result;
                }
            }
            finally {
                _d = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = unspentsOrderedByValue_1.return)) yield _b.call(unspentsOrderedByValue_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return [];
});
exports.getUTXOsToCoverAmount = getUTXOsToCoverAmount;
const getUTXOsToCoverAmountWithRemainder = (address, amountNeeded, inscriptionLocs) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, e_2, _f, _g;
    const unspentsOrderedByValue = yield (0, exports.getUnspentsForAddressInOrderByValue)(address);
    const retrievedIxs = yield (0, exports.getInscriptionsByWalletBIS)(address);
    const bisInscriptionLocs = retrievedIxs.map((utxo) => utxo.satpoint);
    if (bisInscriptionLocs.length === 0) {
        inscriptionLocs = [];
    }
    else {
        inscriptionLocs = bisInscriptionLocs;
    }
    let sum = 0;
    const result = [];
    try {
        for (var _h = true, unspentsOrderedByValue_2 = __asyncValues(unspentsOrderedByValue), unspentsOrderedByValue_2_1; unspentsOrderedByValue_2_1 = yield unspentsOrderedByValue_2.next(), _e = unspentsOrderedByValue_2_1.done, !_e;) {
            _g = unspentsOrderedByValue_2_1.value;
            _h = false;
            try {
                let utxo = _g;
                const currentUTXO = utxo;
                const utxoSatpoint = (0, exports.getSatpointFromUtxo)(currentUTXO);
                if ((inscriptionLocs &&
                    (inscriptionLocs === null || inscriptionLocs === void 0 ? void 0 : inscriptionLocs.find((utxoLoc) => utxoLoc === utxoSatpoint))) ||
                    currentUTXO.value <= 546) {
                    continue;
                }
                sum += currentUTXO.value;
                result.push(currentUTXO);
                if (sum > amountNeeded) {
                    return result;
                }
            }
            finally {
                _h = true;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (!_h && !_e && (_f = unspentsOrderedByValue_2.return)) yield _f.call(unspentsOrderedByValue_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return result;
});
exports.getUTXOsToCoverAmountWithRemainder = getUTXOsToCoverAmountWithRemainder;
const getTheOtherUTXOsToCoverAmount = (address, amountNeeded, inscriptionLocs) => __awaiter(void 0, void 0, void 0, function* () {
    const unspentsOrderedByValue = yield (0, transactions_1.getUnspentOutputs)(address);
    const retrievedIxs = yield (0, exports.getInscriptionsByWalletBIS)(address);
    const bisInscriptions = retrievedIxs.map((utxo) => utxo.satpoint);
    if (bisInscriptions.length === 0) {
        inscriptionLocs = [];
    }
    else {
        inscriptionLocs = bisInscriptions;
    }
    let sum = 0;
    const result = [];
    for (let i = 0; i < unspentsOrderedByValue.length; i++) {
        const currentUTXO = unspentsOrderedByValue.reverse()[i];
        const utxoSatpoint = (0, exports.getSatpointFromUtxo)(currentUTXO);
        if (inscriptionLocs &&
            (inscriptionLocs === null || inscriptionLocs === void 0 ? void 0 : inscriptionLocs.find((utxoLoc) => utxoLoc === utxoSatpoint))) {
            continue;
        }
        sum += currentUTXO.value;
        result.push(currentUTXO);
        if (sum > amountNeeded) {
            return result;
        }
    }
    return [];
});
exports.getTheOtherUTXOsToCoverAmount = getTheOtherUTXOsToCoverAmount;
const getUTXOByAddressTxIDAndVOut = (address, txId, vOut) => __awaiter(void 0, void 0, void 0, function* () {
    const unspents = yield (0, exports.getUnspentsWithConfirmationsForAddress)(address);
    return unspents.find((utxo) => utxo.tx_hash_big_endian === txId && utxo.tx_output_n === vOut);
});
exports.getUTXOByAddressTxIDAndVOut = getUTXOByAddressTxIDAndVOut;
function calculateAmountGathered(utxoArray) {
    return utxoArray === null || utxoArray === void 0 ? void 0 : utxoArray.reduce((prev, currentValue) => prev + currentValue.value, 0);
}
exports.calculateAmountGathered = calculateAmountGathered;
const getScriptForAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const utxos = yield (0, transactions_1.getUnspentOutputs)(address);
    const { script } = utxos.unspent_outputs[0];
    return script;
});
exports.getScriptForAddress = getScriptForAddress;
//# sourceMappingURL=utils.js.map