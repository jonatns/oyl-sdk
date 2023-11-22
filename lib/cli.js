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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = exports.swapFlow = exports.callAPI = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
const oylib_1 = require("./oylib");
const PSBTTransaction_1 = require("./txbuilder/PSBTTransaction");
const transactions = __importStar(require("./transactions"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ordit_sdk_1 = require("@sadoprotocol/ordit-sdk");
const constants_1 = require("./shared/constants");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const utils_1 = require("./shared/utils");
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
        console.log(v);
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
function inscribeTest(options) {
    return __awaiter(this, void 0, void 0, function* () {
        //WORKFLOW TO INSCRIBE
        //GET & PASS PUBLIC KEY, ADDRESS SENDING FROM, ADDRESS INSCRIPTIOM WILL END UP IN, AND CHANGE ADDRESS
        //PASS THE MEDIA CONTENT (e.g: 'Hello World'), MEDIA TYPE (e.g 'text/plain'), AND META (which will be encoded )
        //PASS feerate and postage (default 1500)
        //Initialize the Inscriber class with these values
        const brc20TransferMeta = (0, constants_1.getBrc20Data)({
            tick: options.token,
            amount: options.amount,
        });
        const transaction = new ordit_sdk_1.Inscriber({
            network: 'mainnet',
            address: options.feeFromAddress,
            publicKey: options.taprootPublicKey,
            changeAddress: options.feeFromAddress,
            destinationAddress: options.feeFromAddress,
            mediaContent: brc20TransferMeta.mediaContent,
            mediaType: brc20TransferMeta.mediaType,
            feeRate: options.feeRate,
            postage: (options === null || options === void 0 ? void 0 : options.postage) || 1500, // base value of the inscription in sats
        });
        //GENERATE COMMIT PAYMENT REQUEST - THIS DUMPS AN ADDRESS FROM THE PUBKEY & TOTAL COST FOR INSCRIPTION
        const revealed = yield transaction.generateCommit();
        //SEND BITCOIN FROM REGULAR ADDRESS TO THE DUMPED ADDRESS
        const wallet = new oylib_1.Wallet();
        const depositRevealFee = yield wallet.createPsbtTx({
            publicKey: options.taprootPublicKey,
            from: options.feeFromAddress,
            to: revealed.address,
            changeAddress: options.feeFromAddress,
            amount: revealed.revealFee,
            fee: options.feeRate,
            signer: options.signer,
        });
        console.log('deposit reveal fee', depositRevealFee);
        //COLLECT_TX_HASH
        const tx_hash = depositRevealFee.txId;
        console.log({ tx_hash });
        //WAIT FOR TRANSACTION TO BE CONFIRMED BEFORE PROCEEDING
        //ONCE THE TX IS CONFIRMED, CHECK IF ITS READY TO BE BUILT
        // const ready = await transaction.isReady()
        //IF READY, BUILD THE REVEAL TX
        yield transaction.isReady({ skipStrictSatsCheck: true });
        yield transaction.build();
        //YOU WILL GET THE PSBT HEX
        const psbtHex = transaction.toHex();
        console.log('transaction: ', psbtHex);
        //PREPARE THE PSBT FOR SIGNING
        const vPsbt = bitcoin.Psbt.fromHex(psbtHex, {
            network: bitcoin.networks.bitcoin,
        });
        //SIGN THE PSBT
        const txnId = yield signInscriptionPsbt(vPsbt, options.feeRate, options.taprootPublicKey, options.signer, options.feeFromAddress);
        console.log({ txnId });
        const psbt = new bitcoin.Psbt();
        let reimbursementAmount = 0;
        const script = yield (0, utils_1.getScriptForAddress)(options.feeFromAddress);
        psbt.addInput({
            hash: txnId,
            index: 0,
            witnessUtxo: {
                value: 546,
                script: Buffer.from(script, 'hex'),
            },
        });
        const vB = psbt.inputCount * 149 + 3 * 32 + 12;
        const fee = vB * options.feeRate;
        const utxosGathered = yield (0, utils_1.getUTXOsToCoverAmount)(options.feeFromAddress, fee);
        const amountGathered = (0, utils_1.calculateAmountGathered)(utxosGathered);
        if (amountGathered === 0 || utxosGathered.length === 0) {
            throw Error('INSUFFICIENT_FUNDS_FOR_INSCRIBE');
        }
        reimbursementAmount = amountGathered - fee;
        if (reimbursementAmount < 0) {
            throw Error('FEES_LESS_THEN_GATHERED');
        }
        for (let utxo of utxosGathered) {
            const { tx_hash_big_endian, tx_output_n, value, script: outputScript, } = utxo;
            psbt.addInput({
                hash: tx_hash_big_endian,
                index: tx_output_n,
                witnessUtxo: { value, script: Buffer.from(outputScript, 'hex') },
            });
        }
        psbt.addOutput({
            value: amountGathered - fee,
            address: options.destinationAddress, // address for inscriber for the user
        });
        const toSignInputs = yield formatOptionsToSignInputs(psbt, false, options.taprootPublicKey, options.feeFromAddress);
        console.log(psbt.toBase64());
        yield options.signer(psbt, toSignInputs);
        psbt.finalizeAllInputs();
        const rawtx = psbt.extractTransaction().toHex();
        console.log('rawtx', rawtx);
        //BROADCAST THE RAW TX TO THE NETWORK
        yield wallet.apiClient.pushTx({ transactionHex: rawtx });
        //GET THE TX_HASH
        const ready_txId = psbt.extractTransaction().getId();
        console.log('ready_tx', ready_txId);
        return ready_txId;
    });
}
function signInscriptionPsbt(psbt, fee, pubKey, signer, address = '', isDry = false) {
    return __awaiter(this, void 0, void 0, function* () {
        //INITIALIZE NEW PSBTTransaction INSTANCE
        const wallet = new oylib_1.Wallet();
        const addressType = transactions.getAddressType(address);
        if (addressType == null)
            throw Error('Invalid Address Type');
        const tx = new PSBTTransaction_1.PSBTTransaction(signer, address, pubKey, addressType, fee);
        //SIGN AND FINALIZE THE PSBT
        const signedPsbt = yield tx.signPsbt(psbt, true, true);
        //@ts-ignore
        psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
        //EXTRACT THE RAW TX
        const rawtx = signedPsbt.extractTransaction().toHex();
        console.log('rawtx', rawtx);
        if (!isDry) {
            //BROADCAST THE RAW TX TO THE NETWORK
            yield wallet.apiClient.pushTx({ transactionHex: rawtx });
        }
        //GET THE TX_HASH
        const ready_txId = psbt.extractTransaction().getId();
        return ready_txId;
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
                const mnemonic = 'rich baby hotel region tape express recipe amazing chunk flavor oven obtain';
                const tapWallet = new oylib_1.Wallet();
                const tapPayload = yield tapWallet.fromPhrase({
                    mnemonic: mnemonic.trim(),
                    hdPath: RequiredPath[3],
                    type: 'taproot',
                });
                const signer = tapPayload.keyring.keyring;
                const tapSigner = signer.signTransaction.bind(signer);
                return yield inscribeTest({
                    feeFromAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    taprootPublicKey: '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
                    changeAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    destinationAddress: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    feeRate: 75,
                    token: 'HODL',
                    signer: tapSigner,
                    amount: 1000,
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