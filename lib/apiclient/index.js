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
exports.OylApiClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class OylApiClient {
    constructor(options) {
        try {
            this.host = options.host;
        }
        catch (err) {
            return err;
        }
    }
    static fromObject(data) {
        const result = new this(data);
        return result;
    }
    toObject() {
        return {
            host: this.host,
        };
    }
    _call(path, method, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json' },
            };
            if (method === 'post' || method === 'put' || method === 'patch') {
                options.body = JSON.stringify(data);
            }
            const response = yield (0, node_fetch_1.default)(`${this.host + path}`, options);
            const payload = yield response.json();
            return payload;
        });
    }
    catch(err) {
        return err;
    }
    importAddress({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/import-address', 'post', { address: address });
        });
    }
    pushTx({ transactionHex }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/broadcast-transaction', 'post', {
                transactionHex: transactionHex,
            });
        });
    }
    getTxByAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/address-transactions', 'post', {
                address: address,
            });
        });
    }
    getBrc20sByAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-address-brc20-balance', 'post', {
                address: address,
            });
        });
    }
    listWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/list-wallets', 'get');
        });
    }
    listTx() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/list-tx', 'get');
        });
    }
    getRawMempool() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/mempool', 'get');
        });
    }
    getMempoolInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/mempool-info', 'get');
        });
    }
    getTickerOffers({ _ticker }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-token-offers', 'post', {
                ticker: _ticker,
            });
            const list = response.data.list;
            return list;
        });
    }
    initSwapBid({ address, auctionId, bidPrice, pubKey }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/initiate-bid', 'post', {
                address,
                auctionId,
                bidPrice,
                pubKey,
            });
        });
    }
    submitSignedBid({ psbtBid, auctionId, bidId }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/finalize-bid', 'post', {
                psbtBid,
                auctionId,
                bidId,
            });
        });
    }
    getFees() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-fees', 'get');
        });
    }
    subscribe({ webhookUrl, rbf = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/subscribe-webhook', 'post', {
                webhookUrl: webhookUrl,
                rbf: rbf,
            });
        });
    }
    importSubscribe({ address, webhookUrl, rbf, }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.importAddress({ address });
            yield this.subscribe({ webhookUrl, rbf });
        });
    }
}
exports.OylApiClient = OylApiClient;
//# sourceMappingURL=index.js.map