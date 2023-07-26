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
exports.runCLI = exports.getOrdInscription = exports.getAllTokens = exports.callAPI = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
const oylib_1 = require("./oylib");
const unisat_1 = require("unisat");
const bcoin = require('bcoin');
const bord_1 = require("./wallet/bord");
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
function getAllTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        const address = "";
        const api = new unisat_1.Unisat({ address: address });
        const brcs = yield api.addressBrcToken({ address });
        console.log(brcs);
        const tickerList = brcs["list"];
        let tokens = ["BTC"];
        for (let i = 0; i < tickerList.length; i++) {
            tokens.push(tickerList[i]["ticker"]);
        }
        console.log(tokens);
        return tokens;
    });
}
exports.getAllTokens = getAllTokens;
function getOrdInscription() {
    return __awaiter(this, void 0, void 0, function* () {
        const address = "";
        const inscriptions = yield (0, bord_1.getInscriptionsByAddr)(address);
        let ordInscriptions = [];
        for (let i = 0; i < inscriptions.length; i++) {
            const genesisTransaction = inscriptions[i].genesis_transaction;
            const txhash = genesisTransaction.substring(genesisTransaction.lastIndexOf("/") + 1);
            if (yield checkProtocol(txhash)) {
                ordInscriptions.push(inscriptions[i]);
            }
        }
        console.log(ordInscriptions.length);
        return ordInscriptions;
    });
}
exports.getOrdInscription = getOrdInscription;
function checkProtocol(txhash) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const rpc = yield loadRpc({});
        const rawtx = yield rpc.client.execute('getrawtransaction', [txhash, 0]);
        const decodedTx = yield rpc.client.execute('decoderawtransaction', [rawtx]);
        const script = bcoin.Script.fromRaw(decodedTx.vin[0].txinwitness[1], "hex");
        const arr = script.toArray();
        if (((_b = (_a = arr[4]) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.toString()) == "ord") {
            return true;
        }
        return false;
    });
}
function runCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const [command] = yargs_1.default.argv._;
        const options = Object.assign({}, yargs_1.default.argv);
        //console.log("yargs.argv._", yargs.argv._);
        delete options._;
        switch (command) {
            case 'load':
                return yield loadRpc(yargs_1.default.argv._[1]);
                break;
            case 'get':
                return yield getOrdInscription();
            default:
                return yield callAPI(yargs_1.default.argv._[0], options);
                break;
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map