"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = exports.callAPI = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
const oylib_1 = require("./oylib");
async function loadRpc(options) {
    const rpcOptions = {};
    rpcOptions["host"] = options.host;
    rpcOptions["port"] = options.port;
    rpcOptions["network"] = options.network;
    rpcOptions["apiKey"] = options.apiKey;
    rpcOptions["nodeClient"] = options.nodeClient;
    rpcOptions["node"] = options.node;
    const rpc = oylib_1.WalletUtils.fromObject(rpcOptions);
    return rpc;
}
exports.loadRpc = loadRpc;
async function callAPI(command, data, options = {}) {
    const rpc = await loadRpc(options);
    const camelCommand = (0, change_case_1.camelCase)(command);
    console.log(`${camelCommand}(${data})`);
    if (!rpc[camelCommand])
        throw Error("command not foud: " + command);
    const result = await rpc[camelCommand](data);
    console.log(JSON.stringify(result, null, 2));
    return result;
}
exports.callAPI = callAPI;
async function runCLI() {
    const [command] = yargs_1.default.argv._;
    const options = Object.assign({}, yargs_1.default.argv);
    delete options._;
    switch (command) {
        case "load":
            return await loadRpc(yargs_1.default.argv._[1]);
            break;
        default:
            return await callAPI(yargs_1.default.argv._[0], yargs_1.default.argv._[1], options);
            break;
    }
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map