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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = exports.callAPI = exports.loadRpc = void 0;
var yargs_1 = __importDefault(require("yargs"));
var change_case_1 = require("change-case");
var oylib_1 = require("./oylib");
function loadRpc(options) {
    return __awaiter(this, void 0, void 0, function () {
        var rpcOptions, rpc;
        return __generator(this, function (_a) {
            rpcOptions = {};
            rpcOptions["host"] = options.host;
            rpcOptions["port"] = options.port;
            rpcOptions["network"] = options.network;
            rpcOptions["apiKey"] = options.apiKey;
            rpcOptions["nodeClient"] = options.nodeClient;
            rpcOptions["node"] = options.node;
            rpc = oylib_1.WalletUtils.fromObject(rpcOptions);
            return [2 /*return*/, rpc];
        });
    });
}
exports.loadRpc = loadRpc;
function callAPI(command, data, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var rpc, camelCommand, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadRpc(options)];
                case 1:
                    rpc = _a.sent();
                    camelCommand = (0, change_case_1.camelCase)(command);
                    console.log("".concat(camelCommand, "(").concat(data, ")"));
                    if (!rpc[camelCommand])
                        throw Error("command not foud: " + command);
                    return [4 /*yield*/, rpc[camelCommand](data)];
                case 2:
                    result = _a.sent();
                    console.log(JSON.stringify(result, null, 2));
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.callAPI = callAPI;
function runCLI() {
    return __awaiter(this, void 0, void 0, function () {
        var command, options, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    command = yargs_1.default.argv._[0];
                    options = Object.assign({}, yargs_1.default.argv);
                    delete options._;
                    _a = command;
                    switch (_a) {
                        case "load": return [3 /*break*/, 1];
                    }
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, loadRpc(yargs_1.default.argv._[1])];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: return [4 /*yield*/, callAPI(yargs_1.default.argv._[0], yargs_1.default.argv._[1], options)];
                case 4: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map