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
exports.runCLI = exports.inscribe = exports.callBTCRPCEndpoint = exports.RPC_ADDR = exports.createInscriptionScript = exports.MEMPOOL_SPACE_API_V1_URL = exports.swapFlow = exports.callAPI = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
const oylib_1 = require("./oylib");
const PSBTTransaction_1 = require("./txbuilder/PSBTTransaction");
const transactions = __importStar(require("./transactions"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const constants_1 = require("./shared/constants");
const utils_1 = require("./shared/utils");
const axios_1 = __importDefault(require("axios"));
const ecc = __importStar(require("@cmdcode/crypto-utils"));
const tapscript_1 = require("@cmdcode/tapscript");
const ecc2 = __importStar(require("@bitcoinerlab/secp256k1"));
const bip39 = __importStar(require("bip39"));
const bip32_1 = __importDefault(require("bip32"));
const ordit_sdk_1 = require("@sadoprotocol/ordit-sdk");
const bip32 = (0, bip32_1.default)(ecc2);
bitcoin.initEccLib(ecc2);
function loadRpc(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const rpcOptions = {
            host: options.host,
            port: options.port,
            network: options.network,
            auth: options.apiKey,
        };
        const wallet = new oylib_1.Wallet();
        const rpc = wallet.fromProvider(rpcOptions);
        return rpc;
    });
}
exports.loadRpc = loadRpc;
function callAPI(command, data, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const oylSdk = new oylib_1.Wallet();
        const camelCommand = (0, change_case_1.camelCase)(command);
        if (!oylSdk[camelCommand])
            throw Error('command not foud: ' + camelCommand);
        const result = yield oylSdk[camelCommand](data);
        console.log(JSON.stringify(result, null, 2));
        return result;
    });
}
exports.callAPI = callAPI;
function swapFlow(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = options.address;
        const feeRate = options.feeRate;
        const mnemonic = options.mnemonic;
        const pubKey = options.pubKey;
        const psbt = bitcoin.Psbt.fromHex(options.psbt, {
            network: bitcoin.networks.bitcoin,
        });
        const wallet = new oylib_1.Wallet();
        const payload = yield wallet.fromPhrase({
            mnemonic: mnemonic.trim(),
            hdPath: options.hdPath,
            type: options.type,
        });
        const keyring = payload.keyring.keyring;
        const signer = keyring.signTransaction.bind(keyring);
        const from = address;
        const addressType = transactions.getAddressType(from);
        if (addressType == null)
            throw Error('Invalid Address Type');
        const tx = new PSBTTransaction_1.PSBTTransaction(signer, from, pubKey, addressType, feeRate);
        const psbt_ = yield tx.signPsbt(psbt);
        return psbt_.toHex();
    });
}
exports.swapFlow = swapFlow;
const formatOptionsToSignInputs = (_psbt, isRevealTx = false, pubkey, tapAddress) => __awaiter(void 0, void 0, void 0, function* () {
    let toSignInputs = [];
    const psbtNetwork = bitcoin.networks.bitcoin;
    const psbt = typeof _psbt === 'string'
        ? bitcoin.Psbt.fromHex(_psbt, { network: psbtNetwork })
        : _psbt;
    psbt.data.inputs.forEach((v, index) => {
        var _a, _b;
        let script = null;
        let value = 0;
        const tapInternalKey = (0, utils_1.assertHex)(Buffer.from(pubkey, 'hex'));
        const p2tr = bitcoin.payments.p2tr({
            internalPubkey: tapInternalKey,
            network: bitcoin.networks.bitcoin,
        });
        if (((_a = v.witnessUtxo) === null || _a === void 0 ? void 0 : _a.script.toString('hex')) == ((_b = p2tr.output) === null || _b === void 0 ? void 0 : _b.toString('hex'))) {
            v.tapInternalKey = tapInternalKey;
        }
        if (v.witnessUtxo) {
            script = v.witnessUtxo.script;
            value = v.witnessUtxo.value;
        }
        else if (v.nonWitnessUtxo) {
            const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
            const output = tx.outs[psbt.txInputs[index].index];
            script = output.script;
            value = output.value;
        }
        const isSigned = v.finalScriptSig || v.finalScriptWitness;
        if (script && !isSigned) {
            console.log('not signed');
            const address = bitcoinjs_lib_1.address.fromOutputScript(script, psbtNetwork);
            if (isRevealTx || tapAddress === address) {
                console.log('entered', index);
                if (v.tapInternalKey) {
                    console.log('hasTapInternal');
                    toSignInputs.push({
                        index: index,
                        publicKey: pubkey,
                        sighashTypes: v.sighashType ? [v.sighashType] : undefined,
                    });
                }
            }
            // else {
            //   toSignInputs.push({
            //     index: index,
            //     publicKey: this.segwitPubKey,
            //     sighashTypes: v.sighashType ? [v.sighashType] : undefined,
            //   })
            // }
        }
    });
    return toSignInputs;
});
exports.MEMPOOL_SPACE_API_V1_URL = 'https://mempool.space/api/v1';
const getRecommendedBTCFeesMempool = () => __awaiter(void 0, void 0, void 0, function* () {
    const gen_res = yield axios_1.default
        .get(`${exports.MEMPOOL_SPACE_API_V1_URL}/fees/recommended`, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.data);
    return yield gen_res;
});
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
const INSCRIPTION_PREPARE_SAT_AMOUNT = 4000;
exports.RPC_ADDR = 'https://node.oyl.gg/v1/6e3bc3c289591bb447c116fda149b094';
const callBTCRPCEndpoint = (method, params) => __awaiter(void 0, void 0, void 0, function* () {
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
const inscribe = ({ ticker, amount, inputAddress, outputAddress, commitTxId, isDry, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const { fastestFee } = yield getRecommendedBTCFeesMempool();
    const inputs = 1;
    const vB = inputs * 149 + 3 * 32 + 12;
    const minerFee = vB * fastestFee;
    const fees = minerFee + 4000;
    try {
        console.log('TRYING');
        const secret = 'd84d671cbd24a08db5ed43b93102484bd9bd8beb657e784451a226cf6a6e259b';
        const secKey = ecc.keys.get_seckey(String(secret));
        const pubKey = ecc.keys.get_pubkey(String(secret), true);
        console.log('GOT THINGS');
        const content = `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amount}"}`;
        const script = (0, exports.createInscriptionScript)(pubKey, content);
        const tapleaf = tapscript_1.Tap.encodeScript(script);
        const [tpubkey, cblock] = tapscript_1.Tap.getPubKey(pubKey, { target: tapleaf });
        const address = tapscript_1.Address.p2tr.fromPubKey(tpubkey);
        if (!commitTxId) {
            console.log('NO COMMIT TX ID');
            let reimbursementAmount = 0;
            const psbt = new bitcoin.Psbt();
            const utxosGathered = yield (0, utils_1.getUTXOsToCoverAmount)(inputAddress, fees);
            const amountGathered = (0, utils_1.calculateAmountGathered)(utxosGathered);
            if (amountGathered === 0) {
                console.log('WAHAHAHAHAH');
                return { error: 'insuffICIENT funds for inscribe' };
            }
            reimbursementAmount = amountGathered - fees;
            try {
                for (var _d = true, utxosGathered_1 = __asyncValues(utxosGathered), utxosGathered_1_1; utxosGathered_1_1 = yield utxosGathered_1.next(), _a = utxosGathered_1_1.done, !_a;) {
                    _c = utxosGathered_1_1.value;
                    _d = false;
                    try {
                        let utxo = _c;
                        const { tx_hash_big_endian, tx_output_n, value, script: outputScript, } = utxo;
                        psbt.addInput({
                            hash: tx_hash_big_endian,
                            index: tx_output_n,
                            witnessUtxo: { value, script: Buffer.from(outputScript, 'hex') },
                        });
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = utxosGathered_1.return)) yield _b.call(utxosGathered_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            psbt.addOutput({
                value: INSCRIPTION_PREPARE_SAT_AMOUNT,
                address: address, // address for inscriber for the user
            });
            if (reimbursementAmount > 546) {
                psbt.addOutput({
                    value: reimbursementAmount,
                    address: inputAddress,
                });
            }
            return {
                psbtHex: psbt.toHex(),
                psbtBase64: psbt.toBase64(),
            };
        }
        console.log('CREATING TX', commitTxId);
        const txData = tapscript_1.Tx.create({
            vin: [
                {
                    txid: commitTxId,
                    vout: 0,
                    prevout: {
                        value: INSCRIPTION_PREPARE_SAT_AMOUNT,
                        scriptPubKey: ['OP_1', tpubkey],
                    },
                },
            ],
            vout: [
                {
                    value: 546,
                    scriptPubKey: tapscript_1.Address.toScriptPubKey(outputAddress),
                },
            ],
        });
        const sig = tapscript_1.Signer.taproot.sign(secKey, txData, 0, { extension: tapleaf });
        txData.vin[0].witness = [sig, script, cblock];
        console.log('ADDED WITNESSES');
        console.log('TX DATA', tapscript_1.Tx.encode(txData).hex);
        if (!isDry) {
            const rpcResponse = yield (0, exports.callBTCRPCEndpoint)('sendrawtransaction', tapscript_1.Tx.encode(txData).hex);
            console.log({ rpcResponse });
            if (!rpcResponse.result) {
                console.log('CALLING AGAIN!!!!!!!!');
                yield (0, utils_1.delay)(10000);
                return (0, exports.inscribe)({
                    ticker,
                    amount,
                    inputAddress,
                    outputAddress,
                    commitTxId,
                });
            }
            return rpcResponse;
        }
        else {
            return { revealTxId: tapscript_1.Tx.util.getTxid(txData) };
        }
    }
    catch (e) {
        // console.error(e);
        return { error: e.message };
    }
});
exports.inscribe = inscribe;
function inscribeTest(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const brc20TransferMeta = (0, constants_1.getBrc20Data)({
                tick: options.token,
                amount: options.amount,
            });
            console.log({ brc20TransferMeta });
            // START CREATING TRANSFER INSCRIPTION
            const { psbtHex: commitTxHex } = yield (0, exports.inscribe)({
                ticker: options.token,
                amount: options.amount,
                inputAddress: options.feeFromAddress,
                outputAddress: options.feeFromAddress,
                isDry: false,
            });
            const commitTxPsbt = bitcoin.Psbt.fromHex(commitTxHex);
            console.log({ commitTxHex });
            console.log({ commitBase64: commitTxPsbt.toBase64() });
            // TODO: NEED TO SIGN HERE
            // console.log('signing all inputs')
            // console.log(options.signer)
            // console.log('input count', commitTx.inputCount)
            // await commitTx.signAllInputsAsync(options.signer)
            // console.log('finalizing')
            // commitTx.finalizeAllInputs()
            // const commitTxId = commitTx.extractTransaction().toHex()
            // const rpcResponse = await callBTCRPCEndpoint(
            //   'sendrawtransaction',
            //   Tx.encode(commitTxHex).hex
            // )
            //
            // console.log({ rpcResponse })
            // console.log({ commitTxId })
            return;
            // console.log({ commitTxHex })
            // return
            // console.log('waiting for 10 seconds')
            // await delay(10000)
            // const commitTxId =
            //   '1bba54c7afa9506a9291461c3219b959051fa8a83d46006150bf803b4dcae932'
            //
            // const result = await inscribe({
            //   ticker: options.token,
            //   amount: options.amount,
            //   inputAddress: options.feeFromAddress,
            //   outputAddress: options.feeFromAddress,
            //   isDry: false,
            //   commitTxId,
            // })
            // const revealTxId =
            //   'aaf3e91effa9380df4d4967b031c6331b4ab4a32705bcba05add25748e369b47'
            // console.log('result', result)
            //
            // // FINISHED CREATING TRANSFER INSCRIPTION
            //
            // // START CREATING PSBT TO SEND TO RECIPIENT
            // const sendTransferPsbt = new bitcoin.Psbt()
            // let reimbursementAmount = 0
            // const script = await getScriptForAddress(options.feeFromAddress)
            // // const transferInscriptionOutput = vPsbt.txOutputs[0] as PsbtTxOutput
            //
            // // console.log({ transferInscriptionOutput })
            //
            // sendTransferPsbt.addInput({
            //   hash: revealTxId as string,
            //   index: 0,
            //   witnessUtxo: {
            //     value: 546,
            //     script: Buffer.from(script, 'hex'),
            //   },
            // })
            //
            // sendTransferPsbt.addOutput({
            //   value: 546,
            //   address: options.destinationAddress,
            // })
            //
            // const vB = sendTransferPsbt.inputCount * 149 + 3 * 32 + 12
            // const fee = vB * options.feeRate
            //
            // const utxosGatheredForFees = await getUTXOsToCoverAmount(
            //   options.feeFromAddress,
            //   fee
            // )
            // const amountGathered = calculateAmountGathered(utxosGatheredForFees)
            // if (amountGathered === 0 || utxosGatheredForFees.length === 0) {
            //   new Error('INSUFFICIENT_FUNDS_FOR_INSCRIBE')
            // }
            //
            // reimbursementAmount = amountGathered - fee
            // if (reimbursementAmount < 0) {
            //   new Error('FEES_LESS_THEN_GATHERED')
            // }
            //
            // for (let utxo of utxosGatheredForFees) {
            //   const {
            //     tx_hash_big_endian,
            //     tx_output_n,
            //     value,
            //     script: outputScript,
            //   } = utxo
            //
            //   sendTransferPsbt.addInput({
            //     hash: tx_hash_big_endian,
            //     index: tx_output_n,
            //     witnessUtxo: { value, script: Buffer.from(outputScript, 'hex') },
            //   })
            // }
            //
            // sendTransferPsbt.addOutput({
            //   value: reimbursementAmount,
            //   address: options.feeFromAddress, // address for inscriber for the user
            // })
            //
            // console.log(sendTransferPsbt.toHex())
            // const toSignInputs: ToSignInput[] = await formatOptionsToSignInputs(
            //   sendTransferPsbt,
            //   false,
            //   options.taprootPublicKey,
            //   options.feeFromAddress
            // )
            // console.log(sendTransferPsbt.toBase64())
            // await options.signer(sendTransferPsbt, toSignInputs)
            // sendTransferPsbt.finalizeAllInputs()
            // const rawTx = sendTransferPsbt.extractTransaction().toHex()
            // console.log({ rawTx })
            // await wallet.apiClient.pushTx({ transactionHex: rawTx })
            // return sendTransferPsbt.extractTransaction().getId()
        }
        catch (err) {
            if (err instanceof Error) {
                console.error(err);
                return Error(`Things exploded (${err.message})`);
            }
            console.error(err);
            return err;
        }
    });
}
function signAndBroadcastInscriptionPsbt(psbt, fee, pubKey, signer, address = '', isDry = false) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const wallet = new oylib_1.Wallet();
            const addressType = transactions.getAddressType(address);
            if (addressType == null)
                new Error('Invalid Address Type');
            const tx = new PSBTTransaction_1.PSBTTransaction(signer, address, pubKey, addressType, fee);
            const signedPsbt = yield tx.signPsbt(psbt, true, true);
            //@ts-ignore
            psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
            const rawtx = signedPsbt.extractTransaction().toHex();
            console.log('signAndBroadcastInscriptionPsbt() rawTx:', rawtx);
            if (!isDry) {
                yield wallet.apiClient.pushTx({ transactionHex: rawtx });
            }
            return psbt.extractTransaction().getId();
        }
        catch (err) {
            if (err instanceof Error) {
                return Error(`Things exploded (${err.message})`);
            }
            return err;
        }
    });
}
function createOrdPsbtTx() {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new oylib_1.Wallet();
        const test0 = yield wallet.createOrdPsbtTx({
            changeAddress: '',
            fromAddress: '',
            inscriptionId: '',
            taprootPubKey: '',
            segwitAddress: '',
            segwitPubKey: '',
            toAddress: '',
            txFee: 0,
            mnemonic: '',
        });
        console.log(test0);
    });
}
function runCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const RequiredPath = [
            "m/44'/0'/0'/0",
            "m/49'/0'/0'/0",
            "m/84'/0'/0'/0",
            "m/86'/0'/0'/0", // P2TR (Taproot)
        ];
        const [command] = yargs_1.default.argv._;
        const options = Object.assign({}, yargs_1.default.argv);
        delete options._;
        switch (command) {
            case 'load':
                return yield loadRpc(options);
                break;
            case 'test':
                const mnemonic = 'speak sustain unfold umbrella lobster sword style kingdom notable agree supply come';
                const tapWallet = new oylib_1.Wallet();
                const tapPayload = yield tapWallet.fromPhrase({
                    mnemonic: mnemonic.trim(),
                    hdPath: RequiredPath[3],
                    type: 'taproot',
                });
                const signer = tapPayload.keyring.keyring;
                const tapSigner = signer.signTransaction.bind(signer);
                const mcndSeedFromMnemonic = yield bip39.mnemonicToSeed(String(mnemonic));
                const internalKey = bip32
                    .fromSeed(mcndSeedFromMnemonic)
                    .derivePath("m/86'/0'/0'/0/0");
                const leafKey = bip32
                    .fromSeed(mcndSeedFromMnemonic)
                    .derivePath("m/86'/0'/0'/0/1");
                const xOnlyInternalPubkey = (0, ordit_sdk_1.toXOnly)(internalKey.publicKey);
                const xOnlyLeafPubkey = (0, ordit_sdk_1.toXOnly)(leafKey.publicKey);
                const tweakedChildNode = internalKey.tweak(bitcoin.crypto.taggedHash('TapTweak', internalKey.publicKey));
                const tweakedSigner = (0, utils_1.tweakSigner)(internalKey);
                console.log({ xOnlyInternalPubkey: xOnlyInternalPubkey.toString('hex') });
                return yield inscribeTest({
                    feeFromAddress: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    taprootPublicKey: '02859513d2338a02f032e55c57c10f418f9b727f9e9f3dc8d8bf90238e61699018',
                    changeAddress: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    destinationAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    feeRate: 75,
                    token: 'BONK',
                    signer: internalKey,
                    amount: 10,
                });
                // async function createOrdPsbtTx() {
                //   const wallet = new Wallet()
                //   const test0 = await wallet.createOrdPsbtTx({
                //     changeAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                //     fromAddress:
                //       'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                //     inscriptionId:
                //       '275d099a2244bee278d451859a74918e7422d20627245c31c86e154a03f0ded7i0',
                //     taprootPubKey:
                //       '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
                //     segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                //     segwitPubKey:
                //       '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
                //     toAddress:
                //       'bc1pkvt4pj7jgj02s95n6sn56fhgl7t7cfx5mj4dedsqyzast0whpchs7ujd7y',
                //     txFee: 68,
                //     mnemonic:
                //       'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
                //   })
                //   console.log(test0)
                // }
                // const resp = await createOrdPsbtTx()
                // return resp
                break;
            default:
                return yield callAPI(yargs_1.default.argv._[0], options);
                break;
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map