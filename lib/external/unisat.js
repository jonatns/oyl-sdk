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
exports.Unisat = void 0;
const randomstring_1 = __importDefault(require("randomstring"));
const base_64_1 = __importDefault(require("base-64"));
const utf8_1 = __importDefault(require("utf8"));
const fetch = (function () { return this; })().fetch;
const DEFAULT_HEADERS = {
    "sec-ch-ua": `"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"`,
    "sec-ch-ua-mobile": `?0`,
    "sec-ch-ua-platform": `"Linux"`,
    "x-address": ``,
    "x-channel": `github`,
    "x-version": `1.1.25`,
    "x-client": `UniSat Wallet`,
    "upgrade-insecure-requests": 1,
    "user-agent": `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36`,
    "accept": `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
    "sec-fetch-site": `none`,
    "sec-fetch-mode": `navigate`,
    "sec-fetch-user": `?1`,
    "sec-fetch-dest": `document`,
    "accept-encoding": `gzip, deflate, br`,
    "accept-language": `en-US,en;q=0.9`
};
const WALLET_API_HEADERS = {
    "accept": "*/*",
    "sec-fetch-site": "none",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
};
const PLAIN_TEXT_HEADERS = {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "origin": "https://unisat.io",
    "sec-fetch-site": "same-site",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "referer": "https://unisat.io/ "
};
class Unisat {
    constructor(options) {
        this.marketUrl = "https://unisat.io/market";
        this.marketApi = "https://market-api.unisat.io";
        this.brcApiv3 = `${this.marketApi}/unisat-market-v3/brc20`;
        this.brcApiv2 = "https://unisat.io/brc20-api-v2/brc20";
        this.api = "https://unisat.io/wallet-api-v4";
        try {
            this.address = (options === null || options === void 0 ? void 0 : options.address) || null;
            this.id = (options === null || options === void 0 ? void 0 : options.id) || randomstring_1.default.generate(12);
        }
        catch (e) {
            console.log("An error occured: ", e);
        }
    }
    getProps() {
        const payload = {
            "address": this.address,
            "id": this.id
        };
        return payload;
    }
    _call(path, method, data = null, extraHeaders = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const reqHeaders = Object.assign({}, DEFAULT_HEADERS, {}, extraHeaders);
            try {
                const response = yield fetch(path, {
                    method: method,
                    headers: reqHeaders,
                    body: JSON.stringify(data),
                });
                const payload = response === null || response === void 0 ? void 0 : response.data;
                if (payload.code == -1) {
                    const newObj = {
                        statusCode: 404,
                        data: {
                            "code": payload.code,
                            "msg": payload.msg,
                            "data": `Request Failed. see ${payload.msg}`,
                            "result": `Request Failed. see ${payload.msg}`
                        }
                    };
                    return newObj;
                }
                const newObj = {
                    statusCode: response === null || response === void 0 ? void 0 : response.status,
                    data: payload
                };
                return newObj;
            }
            catch (error) {
                console.log("An error occured: ", error);
                const newObj = {
                    statusCode: (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status,
                    data: (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data,
                };
                return newObj;
            }
        });
    }
    getTickerHtml({ tick = "oxbt", tab = "1" }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call(`${this.marketUrl}?tick=${tick}&tab=${tab}`, "get");
        });
    }
    getUtxo({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = WALLET_API_HEADERS;
            _headers["x-udid"] = this.id;
            _headers["x-address"] = address;
            const response = yield this._call(`${this.api}/address/btc-utxo?address=${address}`, "get", {}, _headers);
            this.address = address;
            return response.data.result;
        });
    }
    _init() {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = WALLET_API_HEADERS;
            _headers["x-udid"] = this.id;
            return yield this._call(`${this.api}/default/config`, "get", {}, _headers);
        });
    }
    flowCheck({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._init();
            const brc20tokens = yield this.addressBrcToken({ address });
            const ticker = brc20tokens["list"][0]["ticker"];
            const order = yield this.mintBrcToken({
                ticker: ticker,
                feeRate: 13,
                address: address,
                amount: "10"
            });
            const orderid = order["orderId"];
            const paySlip = yield this.getInscribePayslip({ orderid });
            return {
                instruction: `To send ${paySlip.data.amount} satoshis to ${paySlip.data.payAddress}, with feeRate ${paySlip.data.feeRate} from ${paySlip.data.receiveAddress}`,
                //paySlip,
                inscribing: paySlip.data.files,
                orderid
            };
        });
    }
    addressBalance({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = WALLET_API_HEADERS;
            _headers["x-udid"] = this.id;
            _headers["x-address"] = address;
            const response = yield this._call(`${this.api}/address/balance?address=${address}`, "get", {}, _headers);
            this.address = address;
            return response.data.result;
        });
    }
    addressBrcToken({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = WALLET_API_HEADERS;
            _headers["x-udid"] = this.id;
            _headers["x-address"] = address;
            const response = yield this._call(`${this.api}/brc20/tokens?address=${address}&cursor=0&size=100`, "get", {}, _headers);
            this.address = address;
            return response.data.result;
        });
    }
    brcTokenSummary({ address, ticker }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = WALLET_API_HEADERS;
            _headers["x-udid"] = this.id;
            _headers["x-address"] = address;
            const response = yield this._call(`${this.api}/brc20/token-summary?address={address}&ticker=${ticker}`, "get", {}, _headers);
            this.address = address;
            return response.data.result;
        });
    }
    getBrcTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = PLAIN_TEXT_HEADERS;
            const response = yield this._call(`${this.brcApiv3}/auction/brc20_types_many`, "post", {}, _headers);
            return response.data;
        });
    }
    getBrcInfo({ ticker }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = PLAIN_TEXT_HEADERS;
            _headers["referer"] = `https://unisat.io/brc20/${ticker}`;
            _headers["sec-fetch-site"] = "same_origin";
            const response = yield this._call(`${this.brcApiv2}/${ticker}/info`, "get", {}, _headers);
            return response.data;
        });
    }
    getBrcHolders({ ticker }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = PLAIN_TEXT_HEADERS;
            _headers["referer"] = `https://unisat.io/brc20/${ticker}`;
            _headers["sec-fetch-site"] = "same_origin";
            const response = yield this._call(`${this.brcApiv2}/${ticker}/holders?start=0&limit=50`, "get", {}, _headers);
            return response.data;
        });
    }
    mintBrcToken({ ticker, feeRate, address, amount }) {
        return __awaiter(this, void 0, void 0, function* () {
            const protocolMessage = `{"p":"brc-20","op":"mint","tick":"${ticker}","amt":"${amount}"}`;
            const bytes = utf8_1.default.encode(protocolMessage);
            const encoded = base_64_1.default.encode(bytes);
            const data = [
                {
                    "dataURL": `data:text/plain;charset=utf-8;base64,${encoded}`,
                    "filename": `{\"p\":\"brc-20\",\"op\":\"mint...tick\":\"${ticker}\",\"amt\":\"${amount}\"}`
                }
            ];
            const _headers = PLAIN_TEXT_HEADERS;
            _headers["content-length"] = "349";
            const response = yield this._call(`${this.marketApi}/backend/inscribe/order`, "post", {
                "balance": 546,
                "brand": "-",
                "feeRate": feeRate,
                "files": data,
                "id": randomstring_1.default.generate(16),
                "receiveAddress": address,
                "referrer": ""
            }, _headers);
            return response.data;
        });
    }
    getInscribePayslip({ orderid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = {
                "sec-ch-ua": `"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"`,
                "accept": `application/json, text/plain, */*`,
                "sec-ch-ua-mobile": `?0`,
                "user-agent": `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36`,
                "sec-ch-ua-platform": `"Linux"`,
                "origin": `https://unisat.io`,
                "sec-fetch-site": `same-site`,
                "sec-fetch-mode": `cors`,
                "sec-fetch-dest": `empty`,
                "referer": "https://unisat.io/",
                "accept-encoding": `gzip, deflate, br`,
                "accept-language": `en-US,en;q=0.9`
            };
            const resp = yield fetch(`${this.marketApi}/backend/inscribe/order/${orderid}`, {
                method: "GET",
                headers: _headers
            });
            const text = yield resp.text();
            const newObj = {
                statusCode: resp === null || resp === void 0 ? void 0 : resp.status,
                data: text
            };
            return text;
            // console.log(`${this.marketApi}/backend/inscribe/order/${orderid}`)
            // const response = await this._call(
            //   `${this.marketApi}/backend/inscribe/order/${orderid}`,
            //   "get",
            //   {},
            //   _headers
            // );
            // return response.data;
        });
    }
    getBrcConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = PLAIN_TEXT_HEADERS;
            _headers["content-length"] = "2";
            return yield this._call(`${this.brcApiv3}/auction/config`, "post", {}, _headers);
        });
    }
    getInscriptionUtxo({ ordid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = WALLET_API_HEADERS;
            _headers["x-udid"] = this.id;
            _headers["x-address"] = this.address ? this.address : "";
            const response = yield this._call(`${this.api}/inscription/utxo?inscriptionId=${ordid}`, "get", {}, _headers);
            return response.data.result;
        });
    }
    getBrcListings({ tick }) {
        return __awaiter(this, void 0, void 0, function* () {
            const _headers = PLAIN_TEXT_HEADERS;
            _headers["content-length"] = "120";
            return yield this._call(`${this.brcApiv3}/auction/list`, "post", {
                "filter": {
                    "isEnd": false,
                    "nftConfirm": true,
                    "nftType": "brc20",
                    "tick": tick
                },
                "limit": 20,
                "sort": {
                    "unitPrice": 1
                },
                "start": 0
            }, _headers);
        });
    }
}
exports.Unisat = Unisat;
//# sourceMappingURL=unisat.js.map