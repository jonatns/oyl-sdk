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
exports.runCLI = exports.callBTCRPCEndpoint = exports.RPC_ADDR = exports.createInscriptionScript = exports.MEMPOOL_SPACE_API_V1_URL = exports.callAPI = exports.viewPsbt = exports.testAggregator = exports.testMarketplaceBuy = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
const oylib_1 = require("./oylib");
const PSBTAggregator_1 = require("./PSBTAggregator");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utils_1 = require("./shared/utils");
const axios_1 = __importDefault(require("axios"));
const ecc2 = __importStar(require("@bitcoinerlab/secp256k1"));
const buildMarketplaceTransaction_1 = require("./txbuilder/buildMarketplaceTransaction");
bitcoin.initEccLib(ecc2);
function loadRpc(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new oylib_1.Oyl();
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
            price: 0.001,
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
// async function createOrdPsbtTx() {
//   const wallet = new Oyl()
//   const test0 = await wallet.createOrdPsbtTx({
//     changeAddress: '',
//     fromAddress: '',
//     inscriptionId: '',
//     taprootPubKey: '',
//     segwitAddress: '',
//     segwitPubKey: '',
//     toAddress: '',
//     txFee: 0,
//     mnemonic: '',
//   })
//   console.log(test0)
// }
function runCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const [command] = yargs_1.default.argv._;
        const options = Object.assign({}, yargs_1.default.argv);
        const tapWallet = new oylib_1.Oyl();
        const mnemonic = 'rich baby hotel region tape express recipe amazing chunk flavor oven obtain';
        const taprootAddress = 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm';
        const segwitAddress = '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic';
        const taprootHdPathWithIndex = oylib_1.TAPROOT_HD_PATH;
        const segwitHdPathWithIndex = oylib_1.NESTED_SEGWIT_HD_PATH;
        const taprootPubkey = '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be';
        const segwitPubkey = '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b';
        const taprootSigner = yield (0, utils_1.createTaprootSigner)({
            mnemonic,
            taprootAddress,
            hdPathWithIndex: taprootHdPathWithIndex,
        });
        const segwitSigner = yield (0, utils_1.createSegwitSigner)({
            mnemonic,
            segwitAddress,
            hdPathWithIndex: segwitHdPathWithIndex,
        });
        // const getAddress
        const psbtsForTaprootAddressEndingDTM = {
            psbtHex: '70736274ff0100890200000001578ad7f2a593f9447a8ef0f790a9b1abfc81a6b2796920db573595a6c24c747a0100000000ffffffff02f420000000000000225120a8304c4cab8e15810e0a7d58741b3dcb3520339af31ecf3b264a1f5267cf1cc301100000000000002251200d89d702fafc100ab8eae890cbaf40b3547d6f1429564cf5d5f8d517f4caa390000000000001012b235e0000000000002251200d89d702fafc100ab8eae890cbaf40b3547d6f1429564cf5d5f8d517f4caa390000000',
            psbtBase64: 'cHNidP8BAIkCAAAAAVeK1/Klk/lEeo7w95Cpsav8gaayeWkg21c1labCTHR6AQAAAAD/////AvQgAAAAAAAAIlEgqDBMTKuOFYEOCn1YdBs9yzUgM5rzHs87JkofUmfPHMMBEAAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAAAAAAABASsjXgAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAAAA',
        };
        // segwitPubKey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
        delete options._;
        switch (command) {
            case 'load':
                return yield loadRpc(options);
                break;
            case 'send':
                const taprootResponse = yield tapWallet.createBtcTx({
                    to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    from: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    amount: 4000,
                    feeRate: 62,
                    mnemonic,
                    publicKey: taprootPubkey,
                    segwitAddress,
                    segwitHdPathWithIndex,
                    segwitPubkey: '',
                    taprootHdPathWithIndex,
                });
                console.log({ taprootResponse });
                const segwitResponse = yield tapWallet.createBtcTx({
                    to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    from: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    amount: 4000,
                    feeRate: 62,
                    publicKey: taprootPubkey,
                    mnemonic,
                    segwitAddress,
                    segwitHdPathWithIndex,
                    segwitPubkey,
                    taprootHdPathWithIndex,
                });
                console.log({ segwitResponse });
                return;
            case 'test':
                return yield tapWallet.sendBRC20({
                    isDry: true,
                    feeFromAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    taprootPublicKey: '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
                    changeAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    destinationAddress: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
                    feeRate: 10,
                    token: 'BONK',
                    segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    segwitPubkey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
                    mnemonic: mnemonic,
                    amount: 40,
                    payFeesWithSegwit: true,
                    segwitHdPath: oylib_1.NESTED_SEGWIT_HD_PATH,
                    taprootHdPath: oylib_1.TAPROOT_HD_PATH,
                });
                break;
            case 'send-collectible':
                return yield tapWallet.sendOrdCollectible({
                    isDry: true,
                    changeAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    feeFromAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
                    inscriptionId: '68069fc341a462cd9a01ef4808b0bda0db7c0c6ea5dfffdc35b8992450cecb5bi0',
                    taprootPublicKey: '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
                    segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
                    segwitPubkey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
                    destinationAddress: 'bc1pkvt4pj7jgj02s95n6sn56fhgl7t7cfx5mj4dedsqyzast0whpchs7ujd7y',
                    feeRate: 10,
                    payFeesWithSegwit: false,
                    mnemonic: 'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
                    segwitHdPath: oylib_1.NESTED_SEGWIT_HD_PATH,
                    taprootHdPath: oylib_1.TAPROOT_HD_PATH,
                });
                break;
            case 'view':
                return yield viewPsbt();
                break;
            case 'market':
                return yield testMarketplaceBuy();
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