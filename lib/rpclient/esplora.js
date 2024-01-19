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
exports.EsploraRpc = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class EsploraRpc {
    constructor(url) {
        this.esploraUrl = url;
    }
    _call(method, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestData = {
                jsonrpc: '2.0',
                method: method,
                params: params,
                id: 1,
            };
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
                cache: 'no-cache',
            };
            try {
                const response = yield (0, node_fetch_1.default)(this.esploraUrl, requestOptions);
                const responseData = yield response.json();
                if (responseData.error) {
                    console.error('Esplora JSON-RPC Error:', responseData.error);
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
    getTxInfo(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('esplora_tx', [txid]);
        });
    }
    getTxStatus(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('esplora_tx::status', [txid]);
        });
    }
    getTxHex(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('esplora_tx::hex', [txid]);
        });
    }
    getTxRaw(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('esplora_tx::raw', [txid]);
        });
    }
    getTxOutspends(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('esplora_tx::outspends', [txid]);
        });
    }
    getAddressTx(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('esplora_address::txs', [address]);
        });
    }
    getAddressUtxo(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('esplora_address::utxo', [address]);
            return response;
        });
    }
    getFeeEstimates() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('esplora_fee-estimates');
        });
    }
}
exports.EsploraRpc = EsploraRpc;
//# sourceMappingURL=esplora.js.map