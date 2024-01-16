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
const oylib_1 = require("../oylib");
const PSBTAggregator_1 = require("../PSBTAggregator");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const axios_1 = __importDefault(require("axios"));
const ecc2 = __importStar(require("@bitcoinerlab/secp256k1"));
const helpers_1 = require("yargs/helpers");
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
//   const intent = new (options)
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
const tapWallet = new oylib_1.Oyl({
    network: 'mainnet',
    baseUrl: 'https://mainnet.sandshrew.io',
    version: 'v1',
    projectId: 'd6aebfed1769128379aca7d215f0b689',
});
const testWallet = new oylib_1.Oyl({
    network: 'testnet',
    baseUrl: 'https://testnet.sandshrew.io',
    version: 'v1',
    projectId: 'd6aebfed1769128379aca7d215f0b689',
});
const XVERSE = 'xverse';
const UNISAT = 'unisat';
const MAINNET = 'mainnet';
const TESTNET = 'testnet';
const config = {
    [MAINNET]: {
        mnemonic: 'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
        wallet: tapWallet,
        taprootAddress: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        taprootPubkey: '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
        segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
        segwitPubKey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
        destinationTaprootAddress: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
        feeRate: 25,
    },
    [TESTNET]: {
        mnemonic: 'upgrade float mixed life shy bread ramp room artist road major purity',
        wallet: testWallet,
        taprootAddress: 'tb1pstyemhl9n2hydg079rgrh8jhj9s7zdxh2g5u8apwk0c8yc9ge4eqp59l22',
        taprootPubkey: '0385c264c7b6103eae8dc6ef31c5048b9f71b8c373585fe2cac943c6d262598ffc',
        segwitAddress: 'tb1qac6u4rxej8n275tmk8k4aeadxulwlxxa5vk4vs',
        segwitPubKey: '0385c264c7b6103eae8dc6ef31c5048b9f71b8c373585fe2cac943c6d262598ffc',
        destinationTaprootAddress: 'tb1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqs77dhfz',
        feeRate: 1,
    },
};
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .usage('Usage: $0 <command> [options]')
    .option('network', {
    alias: 'n',
    describe: 'Choose network type',
    choices: ['mainnet', 'testnet'],
    default: 'testnet',
})
    .command('load', 'Load RPC command', {})
    .command('send', 'Send btc', (yargs) => {
    return yargs
        .option('to', {
        alias: 't',
        describe: 'Destination address for the transaction',
        type: 'string',
        default: config[yargs.argv['network']].destinationTaprootAddress,
    })
        .option('amount', {
        alias: 'a',
        describe: 'Amount of currency to send',
        type: 'number',
        default: 600,
    })
        .option('feeRate', {
        alias: 'f',
        describe: 'Fee rate for the transaction',
        type: 'number',
        default: config[yargs.argv['network']].feeRate,
    })
        .option('mnemonic', {
        describe: 'Mnemonic for the wallet',
        type: 'string',
        default: config[yargs.argv['network']].mnemonic,
    })
        .help().argv;
})
    .command('send-brc-20', 'Send BRC20 tokens', (yargs) => {
    return yargs
        .option('to', {
        alias: 't',
        describe: 'Destination address for the brc-20',
        type: 'string',
        default: config[yargs.argv['network']].destinationTaprootAddress,
    })
        .option('ticker', {
        alias: 'tik',
        describe: 'brc-20 ticker to send',
        type: 'string',
        demandOption: true,
    })
        .option('amount', {
        alias: 'a',
        describe: 'Amount of brc-20 to send',
        type: 'number',
        default: 5,
    })
        .option('feeRate', {
        alias: 'f',
        describe: 'Fee rate for the transaction',
        type: 'number',
        default: config[yargs.argv['network']].feeRate,
    })
        .option('mnemonic', {
        describe: 'Mnemonic for the wallet',
        type: 'string',
        default: config[yargs.argv['network']].mnemonic,
    })
        .option('isDry', {
        describe: 'Dry run',
        type: 'string',
        default: false,
    })
        .help().argv;
})
    .command('send-collectible', 'Send a collectible', (yargs) => {
    return yargs
        .option('to', {
        alias: 't',
        describe: 'Destination address for the collectible',
        type: 'string',
        default: config[yargs.argv['network']].destinationTaprootAddress,
    })
        .option('inscriptionId', {
        alias: 'ixId',
        describe: 'Inscription to be sent',
        type: 'string',
        demandOption: true,
    })
        .option('feeRate', {
        alias: 'f',
        describe: 'Fee rate for the transaction',
        type: 'number',
        default: config[yargs.argv['network']].feeRate,
    })
        .option('mnemonic', {
        describe: 'Mnemonic for the wallet',
        type: 'string',
        default: config[yargs.argv['network']].mnemonic,
    })
        .option('isDry', {
        describe: 'Dry run',
        type: 'string',
        default: false,
    })
        .help().argv;
})
    .command('view', 'View PSBT', {})
    .command('convert', 'Convert PSBT', {})
    .command('aggregate', 'Test Aggregator', {})
    .command('ord-test', 'ORD test', {})
    .command('txn-history', 'Transaction history', {})
    .command('testnet-send', 'Send testnet transaction', {})
    .command('gen-testnet-wallet', 'Generate testnet wallet', {})
    .command('testnet-sendBRC20', 'Send testnet BRC20 tokens', {})
    .command('testnet-send-collectible', 'Send testnet collectible', {})
    .help().argv;
function runCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const [command] = argv._;
        const { _, network = TESTNET } = yargs_1.default.argv;
        const options = Object.assign({}, yargs_1.default.argv);
        const networkConfig = config[network];
        console.log({ network });
        const { mnemonic, to, amount, feeRate, isDry, ticker } = options;
        switch (command) {
            case 'load':
                return yield loadRpc(options);
            case 'send':
                const sendResponse = yield networkConfig.wallet.sendBtc({
                    mnemonic,
                    to,
                    from: networkConfig.taprootAddress,
                    publicKey: networkConfig.taprootPubkey,
                    amount,
                    feeRate,
                });
                console.log(sendResponse);
                return sendResponse;
            case 'send-brc-20':
                const test0 = yield networkConfig.wallet.sendBRC20({
                    mnemonic,
                    fromAddress: networkConfig.taprootAddress,
                    taprootPublicKey: networkConfig.taprootPubkey,
                    destinationAddress: to,
                    token: ticker,
                    amount,
                    feeRate,
                    isDry,
                });
                console.log(test0);
                return test0;
            case 'send-collectible':
                const { inscriptionId } = options;
                return yield networkConfig.wallet.sendOrdCollectible({
                    mnemonic: networkConfig.mnemonic,
                    fromAddress: networkConfig.taprootAddress,
                    taprootPublicKey: networkConfig.taprootPubkey,
                    destinationAddress: networkConfig.destinationTaprootAddress,
                    inscriptionId,
                    feeRate,
                    isDry,
                });
            // case 'view':
            //   return await viewPsbt()
            // // case 'market':
            // //   return await testMarketplaceBuy()
            // //   break
            // case 'convert':
            //   return await convertPsbt()
            // case 'aggregate':
            //   return await testAggregator()
            // case 'ord-test':
            //   return await networkConfig.wallet.ordRpc.getInscriptionContent(
            //     inscriptionId2
            //   )
            // case 'txn-history':
            //   const test = new Oyl()
            //   return await test.getTxHistory({
            //     addresses: [networkConfig.taprootAddress, networkConfig.segwitAddress],
            //   })
            default:
                return yield callAPI(argv._[0], options);
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map