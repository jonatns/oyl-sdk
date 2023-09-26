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
function loadRpc(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const rpcOptions = {
            host: options.host,
            port: options.port,
            network: options.network,
            auth: options.apiKey
        };
        const wallet = new oylib_1.Wallet();
        const rpc = wallet.fromProvider(rpcOptions);
        return rpc;
    });
}
exports.loadRpc = loadRpc;
function callAPI(command, data, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const rpc = yield loadRpc(options);
        const camelCommand = (0, change_case_1.camelCase)(command);
        if (!rpc[camelCommand])
            throw Error('command not foud: ' + command);
        const result = yield rpc[camelCommand](data);
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
        const psbt = bitcoin.Psbt.fromHex(options.psbt, { network: bitcoin.networks.bitcoin });
        const wallet = new oylib_1.Wallet();
        const payload = yield wallet.fromPhrase({
            mnemonic: mnemonic.trim(),
            hdPath: options.hdPath,
            type: options.type
        });
        const keyring = payload.keyring.keyring;
        const signer = keyring.signTransaction.bind(keyring);
        const from = address;
        const addressType = transactions.getAddressType(from);
        if (addressType == null)
            throw Error("Invalid Address Type");
        const tx = new PSBTTransaction_1.PSBTTransaction(signer, from, pubKey, addressType, feeRate);
        const psbt_ = yield tx.signPsbt(psbt);
        return psbt_.toHex();
    });
}
exports.swapFlow = swapFlow;
// export async function getOrdInscription() {
//    const address = "";
//    const inscriptions = await getInscriptionsByAddr(address);
//    let ordInscriptions = [];
//    for (let i = 0; i < inscriptions.length; i++) {
//     const genesisTransaction = inscriptions[i].genesis_transaction;
//     const txhash = genesisTransaction.substring(genesisTransaction.lastIndexOf("/") + 1);
//     if (await checkProtocol(txhash)) {
//       ordInscriptions.push(inscriptions[i]);
//     }
//   }
//   console.log(ordInscriptions.length)
//   return ordInscriptions;
// }
// async function checkProtocol (txhash) {
//   const rpc = await loadRpc({})
//   const rawtx = await rpc.client.execute('getrawtransaction', [ txhash, 0 ]);
//   const decodedTx = await rpc.client.execute('decoderawtransaction', [ rawtx ])
//   const script = bcoin.Script.fromRaw(decodedTx.vin[0].txinwitness[1], "hex")
//   const arr = script.toArray();
//   if (arr[4]?.data?.toString() == "ord"){
//     return true;
//   }
//   return false;
// }
function runCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const [command] = yargs_1.default.argv._;
        const options = Object.assign({}, yargs_1.default.argv);
        delete options._;
        switch (command) {
            case 'load':
                return yield loadRpc(options);
                break;
            default:
                return yield callAPI(yargs_1.default.argv._[0], options);
                break;
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map