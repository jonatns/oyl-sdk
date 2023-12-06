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
exports.runCLI = exports.swapFlow = exports.callAPI = exports.viewPsbt = exports.testAggregator = exports.testMarketplaceBuy = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
const oylib_1 = require("./oylib");
const PSBTTransaction_1 = require("./txbuilder/PSBTTransaction");
const PSBTAggregator_1 = require("./PSBTAggregator");
const transactions = __importStar(require("./transactions"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ordit_sdk_1 = require("@sadoprotocol/ordit-sdk");
const constants_1 = require("./shared/constants");
require("dotenv/config");
const buildMarketplaceTransaction_1 = require("./txbuilder/buildMarketplaceTransaction");
function loadRpc(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new oylib_1.Wallet();
        try {
            const blockInfo = yield wallet.sandshrewBtcClient.bitcoindRpc.decodePSBT(process.env.PSBT_BASE64);
            const fees = yield wallet.esploraRpc.getAddressUtxo(process.env.TAPROOT_ADDRESS);
            console.log('Block Info:', JSON.stringify(blockInfo));
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
exports.loadRpc = loadRpc;
function testMarketplaceBuy() {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            address: process.env.TAPROOT_ADDRESS,
            pubKey: process.env.TAPROOT_PUBKEY,
            feeRate: parseFloat(process.env.FEE_RATE),
            psbtBase64: process.env.PSBT_BASE64,
            price: 0.001
        };
        const intent = new buildMarketplaceTransaction_1.BuildMarketplaceTransaction(options);
        const builder = yield intent.psbtBuilder();
        console.log(builder);
    });
}
exports.testMarketplaceBuy = testMarketplaceBuy;
function testAggregator() {
    return __awaiter(this, void 0, void 0, function* () {
        const aggregator = new PSBTAggregator_1.Aggregator();
        const aggregated = yield aggregator.fetchAndAggregateOffers("ordi", 20, 110000);
        const formatOffers = offers => offers.map(offer => ({
            amount: offer.amount,
            unitPrice: offer.unitPrice,
            nftId: offer.offerId,
            marketplace: offer.marketplace
        }));
        console.log("Aggregated Offers");
        console.log("Best Price Offers:", formatOffers(aggregated.bestPrice.offers));
        console.log("Closest Match Offers:", formatOffers(aggregated.closestMatch.offers));
    });
}
exports.testAggregator = testAggregator;
function viewPsbt() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(bitcoin.Psbt.fromBase64(process.env.PSBT_BASE64, {
            network: bitcoin.networks.bitcoin,
        }).data.inputs);
    });
}
exports.viewPsbt = viewPsbt;
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
function swapFlow() {
    return __awaiter(this, void 0, void 0, function* () {
        const address = process.env.TAPROOT_ADDRESS;
        const feeRate = parseFloat(process.env.FEE_RATE);
        const mnemonic = process.env.TAPROOT_MNEMONIC;
        const pubKey = process.env.TAPROOT_PUBKEY;
        const psbt = bitcoin.Psbt.fromHex(process.env.PSBT_HEX, {
            network: bitcoin.networks.bitcoin,
        });
        const wallet = new oylib_1.Wallet();
        const payload = yield wallet.fromPhrase({
            mnemonic: mnemonic.trim(),
            hdPath: process.env.HD_PATH,
            type: process.env.TYPE,
        });
        const keyring = payload.keyring.keyring;
        const signer = keyring.signTransaction.bind(keyring);
        const from = address;
        const addressType = transactions.getAddressType(from);
        if (addressType == null)
            throw Error('Invalid Address Type');
        const tx = new PSBTTransaction_1.PSBTTransaction(signer, from, pubKey, addressType, feeRate);
        const signedPsbt = yield tx.signPsbt(psbt, false);
        signedPsbt.finalizeAllInputs();
        console.log(signedPsbt.toBase64());
        //@ts-ignore
        psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
        //EXTRACT THE RAW TX
        const rawtx = signedPsbt.extractTransaction().toHex();
        console.log('rawtx', rawtx);
        //BROADCAST THE RAW TX TO THE NETWORK
        const result = yield wallet.apiClient.pushTx({ transactionHex: rawtx });
        //GET THE TX_HASH
        console.log(result);
        const ready_txId = psbt.extractTransaction().getId();
        console.log(ready_txId);
        //CONFIRM TRANSACTION IS CONFIRMED
    });
}
exports.swapFlow = swapFlow;
function inscribeTest(options) {
    return __awaiter(this, void 0, void 0, function* () {
        //WORKFLOW TO INSCRIBE
        //GET & PASS PUBLIC KEY, ADDRESS SENDING FROM, ADDRESS INSCRIPTIOM WILL END UP IN, AND CHANGE ADDRESS
        //PASS THE MEDIA CONTENT (e.g: 'Hello World'), MEDIA TYPE (e.g 'text/plain'), AND META (which will be encoded )
        //PASS feerate and postage (default 1500)
        //Initialize the Inscriber class with these values
        const transaction = new ordit_sdk_1.Inscriber({
            network: 'mainnet',
            address: options.feeFromAddress,
            publicKey: options.taprootPublicKey,
            changeAddress: options.feeFromAddress,
            destinationAddress: options.destinationAddress,
            mediaContent: constants_1.BRC_20_TRANSFER_META.mediaContent,
            mediaType: constants_1.BRC_20_TRANSFER_META.mediaType,
            feeRate: options.feeRate,
            meta: constants_1.BRC_20_TRANSFER_META.meta,
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
            amount: (revealed.revealFee / 100000000).toString(),
            fee: options.feeRate,
            signer: options.signer,
        });
        console.log('deposit reveal fee', depositRevealFee);
        //COLLECT_TX_HASH
        const tx_hash = depositRevealFee.txId;
        //WAIT FOR TRANSACTION TO BE CONFIRMED BEFORE PROCEEDING
        //ONCE THE TX IS CONFIRMED, CHECK IF ITS READY TO BE BUILT
        const ready = yield transaction.isReady();
        if (ready) {
            //IF READY, BUILD THE REVEAL TX
            yield transaction.build();
            //YOU WILL GET THE PSBT HEX
            const psbtHex = transaction.toHex();
            console.log('transaction: ', psbtHex);
            //PREPARE THE PSBT FOR SIGNING
            const vPsbt = bitcoin.Psbt.fromHex(psbtHex, {
                network: bitcoin.networks.bitcoin,
            });
            //SIGN THE PSBT
            yield signInscriptionPsbt(vPsbt, options.feeRate, options.taprootPublicKey, options.signer);
        }
    });
}
function signInscriptionPsbt(psbt, fee, pubKey, signer, address = '') {
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
        //BROADCAST THE RAW TX TO THE NETWORK
        const result = yield wallet.apiClient.pushTx({ transactionHex: rawtx });
        //GET THE TX_HASH
        const ready_txId = psbt.extractTransaction().getId();
        //CONFIRM TRANSACTION IS CONFIRMED
    });
}
function createOrdPsbtTx() {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new oylib_1.Wallet();
        const tx = yield wallet.addAccountToWallet({
            mnemonic: process.env.TAPROOT_MNEMONIC,
            activeIndexes: [0],
            customPath: 'unisat',
        });
    });
}
function runCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const [command] = yargs_1.default.argv._;
        const options = Object.assign({}, yargs_1.default.argv);
        delete options._;
        switch (command) {
            case 'load':
                return yield loadRpc(options);
                break;
            case 'recover':
                return yield createOrdPsbtTx();
                break;
            case 'view':
                return yield viewPsbt();
                break;
            case 'market':
                return yield testMarketplaceBuy();
                break;
            case 'swap':
                return yield swapFlow();
                break;
            case 'aggregate':
                return yield testAggregator();
                break;
            default:
                return yield callAPI(yargs_1.default.argv._[0], options);
                break;
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map