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
exports.SandshrewBitcoinClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class SandshrewBitcoinClient {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    _call(method, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestData = {
                jsonrpc: '2.0',
                method: method,
                params: params,
                id: Date.now(), // Use a unique identifier for each request
            };
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            };
            try {
                const response = yield (0, node_fetch_1.default)(this.apiUrl, requestOptions);
                const responseData = yield response.json();
                if (responseData.error) {
                    console.error('JSON-RPC Error:', responseData.error);
                    return null;
                }
                return responseData.result;
            }
            catch (error) {
                console.error('Request Error:', error);
                throw error;
            }
        });
    }
    _createRpcMethod(methodName, argType) {
        this[methodName] = (...args) => __awaiter(this, void 0, void 0, function* () {
            const convertedArgs = args.map((arg, index) => {
                return this._convertArg(arg, argType);
            });
            return this._call(methodName, convertedArgs);
        });
    }
    _convertArg(arg, argType) {
        switch (argType) {
            case 'str':
                return arg.toString();
            case 'int':
                return parseFloat(arg);
            case 'float':
                return parseFloat(arg);
            case 'bool':
                return (arg === true || arg == '1' || arg == 'true' || arg.toString().toLowerCase() == 'true');
            case 'obj':
                if (typeof arg === 'string') {
                    return JSON.parse(arg);
                }
                return arg;
            default:
                return arg;
        }
    }
}
exports.SandshrewBitcoinClient = SandshrewBitcoinClient;
// Example usage:
//   const bitcoinClient = new SandshrewBitcoinClient('http://localhost:8332');
//# sourceMappingURL=sandshrew.js.map