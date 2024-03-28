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
const regtestApi_1 = require("../tests/regtestApi");
/**
 * Represents the client for interacting with the Oyl API.
 */
class OylApiClient {
    /**
     * Create an instance of the OylApiClient.
     * @param options - Configuration object containing the API host.
     */
    constructor(options) {
        this.host = (options === null || options === void 0 ? void 0 : options.host) || '';
        this.testnet = options.testnet == true;
        this.regtest = options.regtest == true;
        this.apiKey = options.apiKey;
    }
    /**
     * Create an instance of the OylApiClient from a plain object.
     * @param data - The data object.
     * @returns An instance of OylApiClient.
     */
    static fromObject(data) {
        return new this(data);
    }
    /**
     * Convert this OylApiClient instance to a plain object.
     * @returns The plain object representation.
     */
    toObject() {
        return {
            host: this.host,
            testnet: this.testnet,
            apiKey: this.apiKey,
        };
    }
    _call(path, method, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: this.apiKey,
                    },
                    cache: 'no-cache',
                };
                if (this.testnet) {
                    data['testnet'] = this.testnet;
                }
                if (['post', 'put', 'patch'].includes(method)) {
                    options.body = JSON.stringify(data);
                }
                const response = yield (0, node_fetch_1.default)(`${this.host}${path}`, options);
                return yield response.json();
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Get brc20 info by ticker.
     * @param ticker - The ticker to query.
     */
    getBrc20TokenInfo(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-brc20-token-info', 'post', {
                ticker: ticker,
            });
        });
    }
    /**
     * Get brc20 details by ticker.
     * @param ticker - The ticker to query.
     */
    getBrc20TokenDetails(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-brc20-token-details', 'post', {
                ticker: ticker,
            });
        });
    }
    /**
     * Get Brc20 balances by address.
     * @param address - The address to query.
     */
    getBrc20sByAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-address-brc20-balance', 'post', {
                address: address,
            });
        });
    }
    getBrcPrice(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-brc-price', 'post', {
                ticker: ticker,
            });
        });
    }
    getBrc20Tickers(tickerParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-brc20-tickers', 'post', tickerParams);
        });
    }
    getAllInscriptionsByAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.regtest) {
                return yield (0, regtestApi_1.getAllInscriptionsByAddressRegtest)(address);
            }
            else {
                return yield this._call('/get-inscriptions', 'post', {
                    address: address,
                    exclude_brc20: false,
                    count: 20,
                    order: 'desc',
                });
            }
        });
    }
    getInscriptionsForTxn(txn_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this._call('/get-inscriptions-for-txn', 'post', {
                tx_id: txn_id,
                testnet: this.testnet,
            });
            return res.data;
        });
    }
    getTaprootTxHistory(taprootAddress, totalTxs) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this._call('/get-taproot-history', 'post', {
                taprootAddress: taprootAddress,
                totalTxs: totalTxs,
            });
            return res.data;
        });
    }
    getTaprootBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this._call('/get-taproot-balance', 'post', {
                address: address,
                testnet: this.testnet,
            });
            if (res.data) {
                return res.data;
            }
            else {
                return res;
            }
        });
    }
    getAddressBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this._call('/get-address-balance', 'post', {
                address: address,
                testnet: this.testnet,
            });
            if (res.data) {
                return res.data;
            }
            else {
                return res;
            }
        });
    }
    /**
     * Get collectible by ID.
     * @param id - The ID of the collectible.
     */
    getCollectiblesById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-inscription-info', 'post', {
                inscription_id: id,
            });
        });
    }
    /**
     * Get collectibles by address.
     * @param address - The address to query.
     */
    getCollectiblesByAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/get-inscriptions', 'post', {
                address: address,
                exclude_brc20: true,
            });
        });
    }
    /**
     * Get Unisat ticker offers.
     * @param _ticker - The ticker to query.
     */
    getUnisatTickerOffers({ ticker }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-token-unisat-offers', 'post', {
                ticker: ticker,
            });
            if (response.error)
                throw Error(response.error);
            return response.data.list;
        });
    }
    /**
     * Get Aggregated brc20 ticker offers for a limit order.
     * @param ticker - The ticker to query.
     * @param limitOrderAmount - The limit order amount.
     * @param marketPrice - The limit order market price.
     * @param testnet - mainnet/testnet network toggle.
     */
    getAggregatedOffers({ ticker, limitOrderAmount, marketPrice, testnet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-brc20-aggregate-offers', 'post', {
                ticker: ticker,
                limitOrderAmount,
                marketPrice,
                testnet,
            });
            if (response.error)
                throw Error(response.error);
            return response;
        });
    }
    /**
     * Get Okx ticker offers.
     * @param _ticker - The ticker to query.
     */
    getOkxTickerOffers({ ticker }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-token-okx-offers', 'post', {
                ticker: ticker,
            });
            if (response.error)
                throw Error(response.error);
            return response.data.items;
        });
    }
    /**
     * Get Okx offer psbt.
     * @param offerId - The offer Id to query.
     */
    getOkxOfferPsbt({ offerId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-token-okx-offers', 'post', {
                offerId: offerId,
            });
            return response;
        });
    }
    /**
     * Get BTC price.
     */
    getBtcPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-bitcoin-price', 'post', { "ticker": null });
            return response;
        });
    }
    /**
   * Get BTC market chart.
   * @param days - The number of days to use as interval.
   */
    getBitcoinMarketChart(days) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-bitcoin-market-chart', 'post', {
                days: days,
            });
            return response;
        });
    }
    /**
     * Get BTC market weekly.
     */
    getBitcoinMarketWeekly() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-bitcoin-market-weekly', 'post', { "ticker": null });
            return response;
        });
    }
    /**
    * Get BTC markets.
    */
    getBitcoinMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-bitcoin-markets', 'post', { "ticker": null });
            return response;
        });
    }
    /**
     * Get Omnisat ticker offers.
     * @param _ticker - The ticker to query.
     */
    getOmnisatTickerOffers({ ticker }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-token-omnisat-offers', 'post', {
                ticker: ticker,
            });
            if (response.error)
                throw Error(response.error);
            return response.data;
        });
    }
    /**
     * Get Omnisat offer psbt.
     * @param offerId - The offer Id to query.
     */
    getOmnisatOfferPsbt({ offerId, ticker, testnet, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._call('/get-omnisat-offer-psbt', 'post', {
                offerId: offerId,
                ticker: ticker,
                testnet,
            });
            return response;
        });
    }
    /**
     * Initialize a swap bid.
     * @param params - Parameters for the bid.
     */
    initSwapBid(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/initiate-unisat-bid', 'post', params);
        });
    }
    /**
     * Submit a signed bid.
     * @param params - Parameters for the signed bid.
     */
    submitSignedBid(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('/finalize-unisat-bid', 'post', params);
        });
    }
}
exports.OylApiClient = OylApiClient;
//# sourceMappingURL=index.js.map