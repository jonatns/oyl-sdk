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
exports.runCLI = exports.callBTCRPCEndpoint = exports.RPC_ADDR = exports.createInscriptionScript = exports.MEMPOOL_SPACE_API_V1_URL = exports.callAPI = exports.convertPsbt = exports.viewPsbt = exports.testAggregator = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
require("dotenv/config");
const oylib_1 = require("../src.ts/oylib");
const PSBTAggregator_1 = require("../src.ts/PSBTAggregator");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const axios_1 = __importDefault(require("axios"));
const ecc2 = __importStar(require("@bitcoinerlab/secp256k1"));
const genWallet_1 = require("./genWallet");
bitcoin.initEccLib(ecc2);
function loadRpc(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new oylib_1.Oyl();
        try {
            const newWallet = yield wallet.getUtxosArtifacts({
                address: 'bc1pmtkac5u6rx7vkwhcnt0gal5muejwhp8hcrmx2yhvjg8nenu7rp3syw6yp0',
            });
            console.log('newWallet:', newWallet);
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
exports.loadRpc = loadRpc;
// export async function testMarketplaceBuy() {
//   const options = {
//     address: process.env.TAPROOT_ADDRESS,
//     pubKey: process.env.TAPROOT_PUBKEY,
//     feeRate: parseFloat(process.env.FEE_RATE),
//     psbtBase64: process.env.PSBT_BASE64,
//     price: 0.001,
//   }
//   const intent = new BuildMarketplaceTransaction(options)
//   const builder = await intent.psbtBuilder()
//   console.log(builder)
// }
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
        const testnetSegwitAddress = 'tb1qac6u4rxej8n275tmk8k4aeadxulwlxxa5vk4vs';
        const testnetTaprootPubKey = '0385c264c7b6103eae8dc6ef31c5048b9f71b8c373585fe2cac943c6d262598ffc';
        const testnetTaprootAddress = 'tb1pstyemhl9n2hydg079rgrh8jhj9s7zdxh2g5u8apwk0c8yc9ge4eqp59l22';
        switch (command) {
            case 'load':
                return yield loadRpc(options);
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
                    inscriptionId: '',
                    segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    segwitPubKey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
                    mnemonic: mnemonic,
                    amount: 40,
                    payFeesWithSegwit: true,
                    segwitHdPath: 'xverse',
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
                    to: 'tb1phq6q90tnfq9xjlqf3zskeeuknsvhg954phrm6fkje7ezfrmkms7q0z4e26',
                    from: testnetTaprootAddress,
                    amount: 500,
                    feeRate: 10,
                    mnemonic: testnetMnemonic,
                    publicKey: testnetTaprootPubKey,
                    segwitAddress: testnetSegwitAddress,
                    payFeesWithSegwit: false,
                    segwitHdPath: 'testnet',
                    segwitPubkey: '031d49049be7501841213c2b5fc503b67b9c4fd33e7f4b29c0e6e2d99d1c39c0c8',
                });
                if (testnetTaprootResponse) {
                    console.log({ testnetTaprootResponse });
                }
                const testnetSegwitResponse = yield testWallet.sendBtc({
                    to: 'tb1qgqw2l0hqglzw020h0yfjv69tuz50aq9m99h632',
                    from: testnetSegwitAddress,
                    amount: 500,
                    feeRate: 10,
                    mnemonic: testnetMnemonic,
                    publicKey: testnetTaprootPubKey,
                    segwitAddress: testnetSegwitAddress,
                    segwitHdPath: 'testnet',
                    segwitPubkey: '031d49049be7501841213c2b5fc503b67b9c4fd33e7f4b29c0e6e2d99d1c39c0c8',
                });
                if (testnetSegwitResponse) {
                    console.log({ testnetSegwitResponse });
                }
                return;
            case 'gen-testnet-wallet':
                (0, genWallet_1.generateWallet)(true, testnetMnemonic);
                return;
            case 'testnet-sendBRC20':
                const testnetBrc20Send = yield testWallet.sendBRC20({
                    isDry: false,
                    fromAddress: testnetTaprootAddress,
                    taprootPublicKey: testnetTaprootPubKey,
                    destinationAddress: 'tb1phq6q90tnfq9xjlqf3zskeeuknsvhg954phrm6fkje7ezfrmkms7q0z4e26',
                    feeRate: 2,
                    token: 'OYLZ',
                    inscriptionId: '46a2d0f05668cd36c64bb8e32c3670025b288885ebd2913ca03ce0288d366fdf',
                    segwitAddress: testnetSegwitAddress,
                    segwitPubKey: '031d49049be7501841213c2b5fc503b67b9c4fd33e7f4b29c0e6e2d99d1c39c0c8',
                    mnemonic: testnetMnemonic,
                    amount: 40,
                    payFeesWithSegwit: true,
                    segwitHdPath: 'testnet',
                });
                console.log(testnetBrc20Send);
                break;
            case 'testnet-send-collectible':
                const testCollectibleSend = yield testWallet.sendOrdCollectible({
                    isDry: false,
                    fromAddress: testnetTaprootAddress,
                    inscriptionId: 'b25dfaeea88930616332bc97b9bde3bbfcfbe62e35e763a07cc4706a2be1ed17i0',
                    taprootPublicKey: testnetTaprootPubKey,
                    segwitAddress: testnetSegwitAddress,
                    segwitPubKey: '031d49049be7501841213c2b5fc503b67b9c4fd33e7f4b29c0e6e2d99d1c39c0c8',
                    destinationAddress: 'tb1pdz8aul7226284e57e9yn4mpyd8f52zpxc7z0gz392e6amrf0s4uq6s3sw6',
                    feeRate: 2,
                    payFeesWithSegwit: true,
                    mnemonic: testnetMnemonic,
                    segwitHdPath: 'testnet',
                });
                console.log(testCollectibleSend);
                break;
            default:
                return yield callAPI(yargs_1.default.argv._[0], options);
                break;
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map