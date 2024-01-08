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
exports.runCLI = exports.callBTCRPCEndpoint = exports.RPC_ADDR = exports.createInscriptionScript = exports.MEMPOOL_SPACE_API_V1_URL = exports.callAPI = exports.convertPsbt = exports.viewPsbt = exports.testAggregator = exports.testMarketplaceBuy = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
require("dotenv/config");
const oylib_1 = require("./oylib");
const PSBTAggregator_1 = require("./PSBTAggregator");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const axios_1 = __importDefault(require("axios"));
const ecc2 = __importStar(require("@bitcoinerlab/secp256k1"));
const marketplace_1 = require("./marketplace");
const transactions_1 = require("./transactions");
bitcoin.initEccLib(ecc2);
function loadRpc() {
    return __awaiter(this, void 0, void 0, function* () {
        const initOptions = {
            baseUrl: 'https://testnet.sandshrew.io',
            version: 'v1',
            projectId: 'd6aebfed1769128379aca7d215f0b689',
            network: 'testnet',
        };
        const wallet = new oylib_1.Oyl(initOptions);
        try {
            const addressType = (0, transactions_1.getAddressType)(process.env.TESTNET_TAPROOT_ADDRESS);
            const newWallet = yield wallet.fromPhrase({
                mnemonic: process.env.TESTNET_TAPROOT_MNEMONIC.trim(),
                hdPath: process.env.TESTNET_TAPROOT_HDPATH,
                addrType: addressType
            });
            console.log('newWallet:', JSON.stringify(newWallet));
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
exports.loadRpc = loadRpc;
function testMarketplaceBuy() {
    return __awaiter(this, void 0, void 0, function* () {
        const marketplaceOptions = {
            address: process.env.TAPROOT_ADDRESS,
            publicKey: process.env.TAPROOT_PUBKEY,
            mnemonic: process.env.TAPROOT_MNEMONIC,
            feeRate: parseFloat(process.env.FEE_RATE)
        };
        const quotes = [
            {
                offerId: "658217b8eff2a5b8b8f74413",
                marketplace: "omnisat",
                ticker: "piza"
            },
            {
                offerId: "658217e4aa74d8b8c6d755d1",
                marketplace: "omnisat",
                ticker: "piza"
            },
        ];
        const marketplace = new marketplace_1.Marketplace(marketplaceOptions);
        const offersToBuy = yield marketplace.processAllOffers(quotes);
        const signedTxs = yield marketplace.buyMarketPlaceOffers(offersToBuy);
        console.log(signedTxs);
    });
}
exports.testMarketplaceBuy = testMarketplaceBuy;
function testAggregator() {
    return __awaiter(this, void 0, void 0, function* () {
        const aggregator = new PSBTAggregator_1.Aggregator();
        const aggregated = yield aggregator.fetchAndAggregateOffers('ordi', 20, 110000);
        const formatOffers = (offers) => offers.map((offer) => ({
            amount: offer.amount,
            unitPrice: offer.unitPrice,
            nftId: offer.offerId,
            marketplace: offer.marketplace,
        }));
        console.log('Aggregated Offers');
        console.log('Best Price Offers:', formatOffers(aggregated.bestPrice.offers));
        console.log('Closest Match Offers:', formatOffers(aggregated.closestMatch.offers));
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
function convertPsbt() {
    return __awaiter(this, void 0, void 0, function* () {
        const psbt = bitcoin.Psbt.fromHex(process.env.PSBT_HEX, {
            network: bitcoin.networks.bitcoin,
        }).toBase64();
        console.log(psbt);
        console.log(bitcoin.Psbt.fromBase64(psbt, {
            network: bitcoin.networks.bitcoin,
        }).data.inputs);
    });
}
exports.convertPsbt = convertPsbt;
function callAPI(command, data, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const oylSdk = new oylib_1.Oyl();
        const camelCommand = (0, change_case_1.camelCase)(command);
        if (!oylSdk[camelCommand])
            throw Error('command not foud: ' + camelCommand);
        const result = yield oylSdk[camelCommand](data);
        console.log(JSON.stringify(result, null, 2));
        return result;
    });
}
exports.callAPI = callAPI;
exports.MEMPOOL_SPACE_API_V1_URL = 'https://mempool.space/api/v1';
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
function runCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const [command] = yargs_1.default.argv._;
        const options = Object.assign({}, yargs_1.default.argv);
        const tapWallet = new oylib_1.Oyl({
            network: 'mainnet',
            baseUrl: 'https://mainnet.sandshrew.io',
            version: 'v1',
            projectId: 'd6aebfed1769128379aca7d215f0b689',
        });
        const mnemonic = 'rich baby hotel region tape express recipe amazing chunk flavor oven obtain';
        const taprootAddress = 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm';
        const segwitAddress = '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic';
        const taprootHdPath = oylib_1.TAPROOT_HD_PATH;
        const segwitHdPath = oylib_1.NESTED_SEGWIT_HD_PATH;
        const taprootPubkey = '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be';
        const segwitPubkey = '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b';
        const psbtsForTaprootAddressEndingDTM = {
            psbtHex: '70736274ff0100890200000001578ad7f2a593f9447a8ef0f790a9b1abfc81a6b2796920db573595a6c24c747a0100000000ffffffff02f420000000000000225120a8304c4cab8e15810e0a7d58741b3dcb3520339af31ecf3b264a1f5267cf1cc301100000000000002251200d89d702fafc100ab8eae890cbaf40b3547d6f1429564cf5d5f8d517f4caa390000000000001012b235e0000000000002251200d89d702fafc100ab8eae890cbaf40b3547d6f1429564cf5d5f8d517f4caa390000000',
            psbtBase64: 'cHNidP8BAIkCAAAAAVeK1/Klk/lEeo7w95Cpsav8gaayeWkg21c1labCTHR6AQAAAAD/////AvQgAAAAAAAAIlEgqDBMTKuOFYEOCn1YdBs9yzUgM5rzHs87JkofUmfPHMMBEAAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAAAAAAABASsjXgAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAAAA',
        };
        const testWallet = new oylib_1.Oyl({
            network: 'testnet',
            baseUrl: 'https://testnet.sandshrew.io',
            version: 'v1',
            projectId: 'd6aebfed1769128379aca7d215f0b689',
        });
        const testnetMnemonic = 'upgrade float mixed life shy bread ramp room artist road major purity';
        const testnetSegwitPubKey = '02a4a49b8efd123ecc2fb200a95d4da40dac7abd563cfb52b8aa245cbca0249c1c';
        const testnetSegwitAddress = 'tb1qsvuaztq2jltrl5pq26njcmn4gdz250325edas2';
        const testnetTaprootPubKey = '036cbe3e4c6ece9e96ae7dabc99cfd3d9ffb3fcefc98d72e64cfc2a615ef9b8c9a';
        const testnetTaprootAddress = 'tb1phq6q90tnfq9xjlqf3zskeeuknsvhg954phrm6fkje7ezfrmkms7q0z4e26';
        switch (command) {
            case 'load':
                return yield loadRpc();
                break;
            case 'send':
                const taprootResponse = yield tapWallet.sendBtc({
                    to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    from: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    amount: 500,
                    feeRate: 25,
                    mnemonic,
                    publicKey: taprootPubkey,
                    segwitAddress,
                    segwitHdPath: 'xverse',
                    segwitPubkey,
                });
                if (taprootResponse) {
                    console.log({ taprootResponse });
                }
                const segwitResponse = yield tapWallet.sendBtc({
                    to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    from: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    amount: 500,
                    feeRate: 25,
                    publicKey: taprootPubkey,
                    mnemonic,
                    segwitAddress,
                    segwitHdPath: 'xverse',
                    segwitPubkey,
                });
                if (segwitResponse) {
                    console.log({ segwitResponse });
                }
                return;
            case 'sendBRC20':
                const test0 = yield tapWallet.sendBRC20({
                    isDry: true,
                    fromAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    taprootPublicKey: '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
                    destinationAddress: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    feeRate: 10,
                    token: 'BONK',
                    segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    segwitPubKey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
                    mnemonic: mnemonic,
                    amount: 40,
                    payFeesWithSegwit: true,
                    segwitHdPath: 'xverse',
                    taprootHdPath: oylib_1.TAPROOT_HD_PATH,
                });
                console.log(test0);
                break;
            case 'send-collectible':
                const test1 = yield tapWallet.sendOrdCollectible({
                    isDry: true,
                    fromAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    inscriptionId: '68069fc341a462cd9a01ef4808b0bda0db7c0c6ea5dfffdc35b8992450cecb5bi0',
                    taprootPublicKey: '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
                    segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    segwitPubKey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
                    destinationAddress: 'bc1pkvt4pj7jgj02s95n6sn56fhgl7t7cfx5mj4dedsqyzast0whpchs7ujd7y',
                    feeRate: 10,
                    payFeesWithSegwit: true,
                    mnemonic: 'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
                    segwitHdPath: 'xverse',
                    taprootHdPath: oylib_1.TAPROOT_HD_PATH,
                });
                console.log(test1);
                break;
            case 'view':
                return yield viewPsbt();
                break;
            // case 'market':
            //   return await testMarketplaceBuy()
            //   break
            case 'convert':
                return yield convertPsbt();
                break;
            case 'aggregate':
                return yield testAggregator();
                break;
            case 'ord-test':
                const testCase = yield tapWallet.ordRpc.getInscriptionContent('6c51990395726ddbd922a3318b5713bb318da8be6aa199ee79cf9bdb6c91e37ai0');
                console.log(testCase);
                return;
                break;
            case 'txn-history':
                const test = new oylib_1.Oyl();
                const testLog = yield test.getTxHistory({
                    addresses: [
                        'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                        '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    ],
                });
                console.log(testLog);
                break;
            case 'testnet-send':
                yield testWallet.recoverWallet({
                    mnemonic: testnetMnemonic,
                    activeIndexes: [0],
                    customPath: 'testnet',
                });
                const testnetTaprootResponse = yield testWallet.sendBtc({
                    to: 'tb1p6l2wm54y9rh6lz3gd4z2ty8w4nftnav7g4fph399f8zy4ed6h9cskmg3le',
                    from: testnetTaprootAddress,
                    amount: 500,
                    feeRate: 10,
                    mnemonic: testnetMnemonic,
                    publicKey: testnetTaprootPubKey,
                    segwitAddress: testnetSegwitAddress,
                    segwitHdPath: 'testnet',
                    segwitPubkey: '02f12478ea8f28d179245d095faf1e14d63b9465d1a5fe2d5e0a107559082f887a',
                });
                if (testnetTaprootResponse) {
                    console.log({ testnetTaprootResponse });
                }
                const testnetSegwitResponse = yield testWallet.sendBtc({
                    to: 'tb1qgqw2l0hqglzw020h0yfjv69tuz50aq9m99h632',
                    from: testnetSegwitAddress,
                    amount: 500,
                    feeRate: 100,
                    mnemonic: testnetMnemonic,
                    publicKey: testnetTaprootPubKey,
                    segwitAddress: testnetSegwitAddress,
                    segwitHdPath: 'testnet',
                    segwitPubkey: '02f12478ea8f28d179245d095faf1e14d63b9465d1a5fe2d5e0a107559082f887a',
                });
                if (testnetSegwitResponse) {
                    console.log({ testnetSegwitResponse });
                }
                return;
            case 'gen-testnet-wallet':
                const genTestWallet = yield testWallet.initializeWallet();
                console.log({
                    mnemonic: genTestWallet.mnemonic,
                    segwit: {
                        address: genTestWallet.segwit.segwitAddresses[0],
                        publicKey: genTestWallet.segwit.segwitKeyring.wallets[0].publicKey.toString('hex'),
                        privateKey: genTestWallet.segwit.segwitKeyring.wallets[0].privateKey.toString('hex'),
                        signer: genTestWallet.segwit.segwitKeyring.signTransaction.bind(genTestWallet.segwit.segwitKeyring),
                    },
                    taproot: {
                        address: genTestWallet.taproot.taprootAddresses[0],
                        publicKey: genTestWallet.taproot.taprootKeyring.wallets[0].publicKey.toString('hex'),
                        privateKey: genTestWallet.taproot.taprootKeyring.wallets[0].privateKey.toString('hex'),
                        signer: genTestWallet.taproot.taprootKeyring.signTransaction.bind(genTestWallet.taproot.taprootKeyring),
                    },
                });
                return;
            default:
                return yield callAPI(yargs_1.default.argv._[0], options);
                break;
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map