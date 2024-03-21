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
exports.isValidJSON = exports.addBtcUtxo = exports.filterUtxos = exports.filterTaprootUtxos = exports.sendCollectible = exports.isP2TR = exports.isP2SHScript = exports.isP2WSHScript = exports.isP2WPKH = exports.isP2PKH = exports.getRawTxnHashFromTxnId = exports.calculateTaprootTxSize = exports.getOutputValueByVOutIndex = exports.waitForTransaction = exports.callBTCRPCEndpoint = exports.RPC_ADDR = exports.createInscriptionScript = exports.signInputs = exports.timeout = exports.formatInputsToSign = exports.formatOptionsToSignInputs = exports.calculateAmountGatheredUtxo = exports.calculateAmountGathered = exports.getInscriptionsByWalletBIS = exports.getSatpointFromUtxo = exports.getWitnessDataChunk = exports.utxoToInput = exports.validator = exports.amountToSatoshis = exports.delay = exports.satoshisToAmount = exports.tweakSigner = exports.checkPaymentType = exports.getNetwork = exports.assertHex = exports.ECPair = exports.inscriptionSats = exports.addressTypeMap = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ecpair_1 = __importDefault(require("ecpair"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const interface_1 = require("../shared/interface");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const constants_1 = require("./constants");
const axios_1 = __importDefault(require("axios"));
const buildOrdTx_1 = require("../txbuilder/buildOrdTx");
const bip371_1 = require("bitcoinjs-lib/src/psbt/bip371");
bitcoin.initEccLib(secp256k1_1.default);
exports.addressTypeMap = { 0: 'p2pkh', 1: 'p2tr', 2: 'p2sh', 3: 'p2wpkh' };
exports.inscriptionSats = 546;
exports.ECPair = (0, ecpair_1.default)(secp256k1_1.default);
const assertHex = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
exports.assertHex = assertHex;
function tapTweakHash(pubKey, h) {
    return bitcoin.crypto.taggedHash('TapTweak', Buffer.concat(h ? [pubKey, h] : [pubKey]));
}
function getNetwork(value) {
    if (value === 'mainnet' || value === 'main') {
        return bitcoin.networks['bitcoin'];
    }
    return bitcoin.networks[value];
}
exports.getNetwork = getNetwork;
function checkPaymentType(payment, network) {
    return (script) => {
        try {
            return payment({ output: script, network: getNetwork(network) });
        }
        catch (error) {
            return false;
        }
    };
}
exports.checkPaymentType = checkPaymentType;
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
const getSatpointFromUtxo = (utxo) => {
    return `${utxo.tx_hash_big_endian}:${utxo.tx_output_n}:0`;
};
exports.getSatpointFromUtxo = getSatpointFromUtxo;
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
function calculateAmountGathered(utxoArray) {
    return utxoArray === null || utxoArray === void 0 ? void 0 : utxoArray.reduce((prev, currentValue) => prev + currentValue.value, 0);
}
exports.calculateAmountGathered = calculateAmountGathered;
function calculateAmountGatheredUtxo(utxoArray) {
    return utxoArray === null || utxoArray === void 0 ? void 0 : utxoArray.reduce((prev, currentValue) => prev + currentValue.satoshis, 0);
}
exports.calculateAmountGatheredUtxo = calculateAmountGatheredUtxo;
const formatOptionsToSignInputs = ({ _psbt, pubkey, segwitPubkey, segwitAddress, taprootAddress, network, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d, _e;
    let toSignInputs = [];
    let index = 0;
    try {
        for (var _f = true, _g = __asyncValues(_psbt.data.inputs), _h; _h = yield _g.next(), _a = _h.done, !_a;) {
            _c = _h.value;
            _f = false;
            try {
                const v = _c;
                let script = null;
                let value = 0;
                const isSigned = v.finalScriptSig || v.finalScriptWitness;
                const lostInternalPubkey = !v.tapInternalKey;
                if (v.witnessUtxo) {
                    script = v.witnessUtxo.script;
                    value = v.witnessUtxo.value;
                }
                else if (v.nonWitnessUtxo) {
                    const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
                    const output = tx.outs[_psbt.txInputs[index].index];
                    script = output.script;
                    value = output.value;
                }
                if (!isSigned || lostInternalPubkey) {
                    const tapInternalKey = (0, exports.assertHex)(Buffer.from(pubkey, 'hex'));
                    const p2tr = bitcoin.payments.p2tr({
                        internalPubkey: tapInternalKey,
                        network: network,
                    });
                    if (((_d = v.witnessUtxo) === null || _d === void 0 ? void 0 : _d.script.toString('hex')) == ((_e = p2tr.output) === null || _e === void 0 ? void 0 : _e.toString('hex'))) {
                        v.tapInternalKey = tapInternalKey;
                        if (v.tapInternalKey) {
                            toSignInputs.push({
                                index: index,
                                publicKey: pubkey,
                                sighashTypes: v.sighashType ? [v.sighashType] : undefined,
                            });
                        }
                    }
                }
                if (script && !isSigned && !(0, bip371_1.isTaprootInput)(v)) {
                    toSignInputs.push({
                        index: index,
                        publicKey: segwitPubkey,
                        sighashTypes: v.sighashType ? [v.sighashType] : undefined,
                    });
                }
                index++;
            }
            finally {
                _f = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_f && !_a && (_b = _g.return)) yield _b.call(_g);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return toSignInputs;
});
exports.formatOptionsToSignInputs = formatOptionsToSignInputs;
const formatInputsToSign = ({ _psbt, senderPublicKey, network, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, e_2, _k, _l;
    var _m, _o;
    let index = 0;
    try {
        for (var _p = true, _q = __asyncValues(_psbt.data.inputs), _r; _r = yield _q.next(), _j = _r.done, !_j;) {
            _l = _r.value;
            _p = false;
            try {
                const v = _l;
                const isSigned = v.finalScriptSig || v.finalScriptWitness;
                const lostInternalPubkey = !v.tapInternalKey;
                if (!isSigned || lostInternalPubkey) {
                    const tapInternalKey = (0, bip371_1.toXOnly)(Buffer.from(senderPublicKey, 'hex'));
                    const p2tr = bitcoin.payments.p2tr({
                        internalPubkey: tapInternalKey,
                        network: network,
                    });
                    if (((_m = v.witnessUtxo) === null || _m === void 0 ? void 0 : _m.script.toString('hex')) === ((_o = p2tr.output) === null || _o === void 0 ? void 0 : _o.toString('hex'))) {
                        v.tapInternalKey = tapInternalKey;
                    }
                }
                index++;
            }
            finally {
                _p = true;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (!_p && !_j && (_k = _q.return)) yield _k.call(_q);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return _psbt;
});
exports.formatInputsToSign = formatInputsToSign;
const timeout = (n) => __awaiter(void 0, void 0, void 0, function* () { return yield new Promise((resolve) => setTimeout(resolve, n)); });
exports.timeout = timeout;
const signInputs = (psbt, toSignInputs, taprootPubkey, segwitPubKey, segwitSigner, taprootSigner) => __awaiter(void 0, void 0, void 0, function* () {
    const taprootInputs = [];
    const segwitInputs = [];
    const inputs = psbt.data.inputs;
    toSignInputs.forEach(({ publicKey }, i) => {
        const input = inputs[i];
        if (publicKey === taprootPubkey && !input.finalScriptWitness) {
            taprootInputs.push(toSignInputs[i]);
        }
        if (segwitPubKey && segwitSigner) {
            if (publicKey === segwitPubKey) {
                segwitInputs.push(toSignInputs[i]);
            }
        }
    });
    if (taprootInputs.length > 0) {
        yield taprootSigner(psbt, taprootInputs);
    }
    if (segwitSigner && segwitInputs.length > 0) {
        yield segwitSigner(psbt, segwitInputs);
    }
    return psbt;
});
exports.signInputs = signInputs;
const createInscriptionScript = (pubKey, content) => {
    const mimeType = 'text/plain;charset=utf-8';
    const textEncoder = new TextEncoder();
    const marker = textEncoder.encode('ord');
    return [
        pubKey,
        'OP_CHECKSIG',
        'OP_0',
        'OP_IF',
        marker,
        '01',
        textEncoder.encode(mimeType),
        'OP_0',
        textEncoder.encode(content),
        'OP_ENDIF',
    ];
};
exports.createInscriptionScript = createInscriptionScript;
exports.RPC_ADDR = 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094';
const callBTCRPCEndpoint = (method, params, network) => __awaiter(void 0, void 0, void 0, function* () {
    if (network === 'testnet') {
        exports.RPC_ADDR =
            'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094';
    }
    if (network === 'regtest') {
        exports.RPC_ADDR === 'http://localhost:3000/v1/regtest';
    }
    const data = JSON.stringify({
        jsonrpc: '2.0',
        id: method,
        method: method,
        params: [params],
    });
    // @ts-ignore
    return yield axios_1.default
        .post(exports.RPC_ADDR, data, {
        headers: {
            'content-type': 'application/json',
        },
    })
        .then((res) => res.data)
        .catch((e) => {
        console.error(e.response);
        throw e;
    });
});
exports.callBTCRPCEndpoint = callBTCRPCEndpoint;
function waitForTransaction({ txId, sandshrewBtcClient, }) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('WAITING FOR TRANSACTION: ', txId);
        const timeout = 60000; // 1 minute in milliseconds
        const startTime = Date.now();
        while (true) {
            try {
                // Call the endpoint to check the transaction
                const result = yield sandshrewBtcClient.bitcoindRpc.getMemPoolEntry(txId);
                // Check if the transaction is found
                if (result) {
                    console.log('Transaction found in mempool:', txId);
                    return [true, result];
                }
                // Check for timeout
                if (Date.now() - startTime > timeout) {
                    console.log('Timeout reached, stopping search.');
                    return [false];
                }
                // Wait for 5 seconds before retrying
                yield new Promise((resolve) => setTimeout(resolve, 5000));
            }
            catch (error) {
                // Check for timeout
                if (Date.now() - startTime > timeout) {
                    console.log('Timeout reached, stopping search.');
                    return [false];
                }
                // Wait for 5 seconds before retrying
                yield new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    });
}
exports.waitForTransaction = waitForTransaction;
function getOutputValueByVOutIndex({ txId, vOut, esploraRpc, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeout = 60000; // 1 minute in milliseconds
        const startTime = Date.now();
        while (true) {
            const txDetails = yield esploraRpc.getTxInfo(txId);
            if ((txDetails === null || txDetails === void 0 ? void 0 : txDetails.vout) && txDetails.vout.length > 0) {
                return [txDetails.vout[vOut].value, txDetails.vout[vOut].scriptpubkey];
            }
            // Check for timeout
            if (Date.now() - startTime > timeout) {
                throw new Error('Timeout reached, stopping search.');
            }
            // Wait for 5 seconds before retrying
            yield new Promise((resolve) => setTimeout(resolve, 5000));
        }
    });
}
exports.getOutputValueByVOutIndex = getOutputValueByVOutIndex;
function calculateTaprootTxSize(taprootInputCount, nonTaprootInputCount, outputCount) {
    const baseTxSize = 10; // Base transaction size without inputs/outputs
    // Size contributions from inputs
    const taprootInputSize = 57; // Average size of a Taproot input (can vary)
    const nonTaprootInputSize = 41; // Average size of a non-Taproot input (can vary)
    const outputSize = 34; // Average size of an output (can vary)
    const totalInputSize = taprootInputCount * taprootInputSize +
        nonTaprootInputCount * nonTaprootInputSize;
    const totalOutputSize = outputCount * outputSize;
    return baseTxSize + totalInputSize + totalOutputSize;
}
exports.calculateTaprootTxSize = calculateTaprootTxSize;
function getRawTxnHashFromTxnId(txnId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post('https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094', {
            jsonrpc: '2.0',
            id: 1,
            method: 'btc_getrawtransaction',
            params: [txnId],
        }, {
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    });
}
exports.getRawTxnHashFromTxnId = getRawTxnHashFromTxnId;
const isP2PKH = (script, network) => {
    const p2pkh = checkPaymentType(bitcoin.payments.p2pkh, network)(script);
    return {
        type: 'p2pkh',
        payload: p2pkh,
    };
};
exports.isP2PKH = isP2PKH;
const isP2WPKH = (script, network) => {
    const p2wpkh = checkPaymentType(bitcoin.payments.p2wpkh, network)(script);
    return {
        type: 'p2wpkh',
        payload: p2wpkh,
    };
};
exports.isP2WPKH = isP2WPKH;
const isP2WSHScript = (script, network) => {
    const p2wsh = checkPaymentType(bitcoin.payments.p2wsh, network)(script);
    return {
        type: 'p2sh',
        payload: p2wsh,
    };
};
exports.isP2WSHScript = isP2WSHScript;
const isP2SHScript = (script, network) => {
    const p2sh = checkPaymentType(bitcoin.payments.p2sh, network)(script);
    return {
        type: 'p2sh',
        payload: p2sh,
    };
};
exports.isP2SHScript = isP2SHScript;
const isP2TR = (script, network) => {
    const p2tr = checkPaymentType(bitcoin.payments.p2tr, network)(script);
    return {
        type: 'p2tr',
        payload: p2tr,
    };
};
exports.isP2TR = isP2TR;
const sendCollectible = ({ inscriptionId, inputAddress, outputAddress, taprootPublicKey, segwitPublicKey, segwitAddress, isDry, segwitSigner, taprootSigner, payFeesWithSegwit = false, feeRate, network, taprootUtxos, segwitUtxos, metaOutputValue, sandshrewBtcClient, }) => __awaiter(void 0, void 0, void 0, function* () {
    const psbt = new bitcoin.Psbt({ network: getNetwork(network) });
    const utxosToSend = yield insertCollectibleUtxo({
        taprootUtxos: taprootUtxos,
        inscriptionId: inscriptionId,
        toAddress: outputAddress,
        psbt: psbt,
    });
    psbt.txOutputs[0].value = metaOutputValue;
    yield (0, buildOrdTx_1.getUtxosForFees)({
        payFeesWithSegwit: payFeesWithSegwit,
        psbtTx: psbt,
        taprootUtxos: taprootUtxos,
        segwitUtxos: segwitUtxos,
        segwitAddress: segwitAddress,
        feeRate: feeRate,
        taprootAddress: inputAddress,
        segwitPubKey: segwitPublicKey,
        utxosToSend: utxosToSend,
        network: getNetwork(network),
        fromAddress: inputAddress,
    });
    const toSignInputs = yield (0, exports.formatOptionsToSignInputs)({
        _psbt: psbt,
        pubkey: taprootPublicKey,
        segwitPubkey: segwitPublicKey,
        segwitAddress: segwitAddress,
        taprootAddress: inputAddress,
        network: getNetwork(network),
    });
    const signedPsbt = yield (0, exports.signInputs)(psbt, toSignInputs, taprootPublicKey, segwitPublicKey, segwitSigner, taprootSigner);
    signedPsbt.finalizeAllInputs();
    const rawTx = signedPsbt.extractTransaction().toHex();
    const txId = signedPsbt.extractTransaction().getId();
    const [result] = yield sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
        rawTx,
    ]);
    if (!result.allowed) {
        throw new Error(result['reject-reason']);
    }
    if (!isDry) {
        yield sandshrewBtcClient.bitcoindRpc.sendRawTransaction(rawTx);
    }
    return { txId, rawTx };
});
exports.sendCollectible = sendCollectible;
const insertCollectibleUtxo = ({ taprootUtxos, inscriptionId, toAddress, psbt, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { metaUtxos } = taprootUtxos.reduce((acc, utxo) => {
        utxo.inscriptions.length
            ? acc.metaUtxos.push(utxo)
            : acc.nonMetaUtxos.push(utxo);
        return acc;
    }, { metaUtxos: [], nonMetaUtxos: [] });
    return yield (0, buildOrdTx_1.addInscriptionUtxo)({
        metaUtxos: metaUtxos,
        inscriptionId: inscriptionId,
        toAddress: toAddress,
        psbtTx: psbt,
    });
});
const filterTaprootUtxos = ({ taprootUtxos, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { nonMetaUtxos } = taprootUtxos.reduce((acc, utxo) => {
        utxo.inscriptions.length > 0 || utxo.satoshis === 546
            ? acc.metaUtxos.push(utxo)
            : acc.nonMetaUtxos.push(utxo);
        return acc;
    }, { metaUtxos: [], nonMetaUtxos: [] });
    return nonMetaUtxos;
});
exports.filterTaprootUtxos = filterTaprootUtxos;
const filterUtxos = ({ utxos }) => __awaiter(void 0, void 0, void 0, function* () {
    const { nonMetaUtxos } = utxos.reduce((acc, utxo) => {
        utxo.value === 546 && utxo.vout === 0
            ? acc.metaUtxos.push(utxo)
            : acc.nonMetaUtxos.push(utxo);
        return acc;
    }, { metaUtxos: [], nonMetaUtxos: [] });
    return nonMetaUtxos;
});
exports.filterUtxos = filterUtxos;
const addBtcUtxo = ({ spendUtxos, toAddress, fromAddress, psbt, amount, feeRate, network, spendAddress, spendPubKey, altSpendAddress, altSpendPubKey, altSpendUtxos, }) => __awaiter(void 0, void 0, void 0, function* () {
    const spendableUtxos = yield (0, exports.filterTaprootUtxos)({
        taprootUtxos: spendUtxos,
    });
    const txSize = calculateTaprootTxSize(2, 0, 2);
    const fee = txSize * feeRate < 250 ? 250 : txSize * feeRate;
    let utxosToSend = (0, buildOrdTx_1.findUtxosToCoverAmount)(spendableUtxos, amount + fee);
    let usingAlt = false;
    if (!utxosToSend) {
        const unFilteredAltUtxos = yield (0, exports.filterTaprootUtxos)({
            taprootUtxos: altSpendUtxos,
        });
        utxosToSend = (0, buildOrdTx_1.findUtxosToCoverAmount)(unFilteredAltUtxos, amount + fee);
        if (!utxosToSend) {
            throw new Error('Insufficient Balance');
        }
        usingAlt = true;
    }
    const amountGathered = calculateAmountGatheredUtxo(utxosToSend.selectedUtxos);
    for (let i = 0; i < utxosToSend.selectedUtxos.length; i++) {
        psbt.addInput({
            hash: utxosToSend.selectedUtxos[i].txId,
            index: utxosToSend.selectedUtxos[i].outputIndex,
            witnessUtxo: {
                value: utxosToSend.selectedUtxos[i].satoshis,
                script: Buffer.from(utxosToSend.selectedUtxos[i].scriptPk, 'hex'),
            },
        });
    }
    psbt.addOutput({
        address: toAddress,
        value: amount,
    });
    const changeAmount = amountGathered - amount - fee;
    if (changeAmount > 546) {
        psbt.addOutput({
            address: spendAddress,
            value: changeAmount,
        });
    }
    const updatedPsbt = yield (0, exports.formatInputsToSign)({
        _psbt: psbt,
        senderPublicKey: usingAlt ? altSpendPubKey : spendPubKey,
        network,
    });
    return updatedPsbt;
});
exports.addBtcUtxo = addBtcUtxo;
const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.isValidJSON = isValidJSON;
//# sourceMappingURL=utils.js.map