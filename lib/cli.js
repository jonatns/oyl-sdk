"use strict";
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
exports.runCLI = exports.callAPI = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
const oylib_1 = require("./oylib");
function loadRpc(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const rpcOptions = {};
        rpcOptions['host'] = options.host;
        rpcOptions['port'] = options.port;
        rpcOptions['network'] = options.network;
        rpcOptions['apiKey'] = options.apiKey;
        rpcOptions['nodeClient'] = options.nodeClient;
        rpcOptions['node'] = options.node;
        const rpc = oylib_1.WalletUtils.fromObject(rpcOptions);
        return rpc;
    });
}
exports.loadRpc = loadRpc;
function callAPI(command, data, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const rpc = yield loadRpc(options);
        const camelCommand = (0, change_case_1.camelCase)(command);
        //console.log(`${camelCommand}(${data})`);
        if (!rpc[camelCommand])
            throw Error('command not foud: ' + command);
        const result = yield rpc[camelCommand](data);
        console.log(JSON.stringify(result, null, 2));
        return result;
    });
}
exports.callAPI = callAPI;
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
                return yield loadRpc(yargs_1.default.argv._[1]);
                break;
            default:
                return yield callAPI(yargs_1.default.argv._[0], options);
                break;
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map