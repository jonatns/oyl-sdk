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
const assert_1 = __importDefault(require("assert"));
const bcurl = require('bcurl');
const { Client } = bcurl;
/**
 * BcoinRpc is a client for interacting with Bcoin's RPC API.
 */
class BcoinRpc extends Client {
    /**
     * Initialize a new Bcoin RPC client.
     * @param options - The options for the Bcoin RPC client.
     */
    constructor(options) {
        super(options);
        this.password = options.password;
    }
    /**
     * Authenticates with the Bcoin RPC API.
     */
    auth() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.call('auth', this.password);
            yield this.watchChain();
            yield this.watchMempool();
        });
    }
    /**
     * Execute an RPC call.
     * @param name - The RPC method name.
     * @param params - The parameters for the RPC call.
     * @returns A promise resolving the RPC call response.
     */
    execute(name, params) {
        return super.execute('/', name, params);
    }
    /**
    * Retrieves the mempool state.
    * @returns A promise resolving with mempool data.
    */
    getMempool() {
        return this.get('/mempool');
    }
    /**
     * Retrieves blockchain and node information.
     * @returns A promise resolving with the info data.
     */
    getInfo() {
        return this.get('/');
    }
    /**
     * Fetches coins associated with a given address.
     * @param address - The address to query.
     * @returns A promise resolving with the coin data.
     */
    getCoinsByAddress(address) {
        (0, assert_1.default)(typeof address === 'string');
        return this.get(`/coin/address/${address}`);
    }
    /**
    * Fetches coins associated with multiple addresses.
    * @param addresses - Array of addresses to query.
    * @returns A promise resolving with the coin data.
    */
    getCoinsByAddresses(addresses) {
        (0, assert_1.default)(Array.isArray(addresses));
        return this.post('/coin/address', { addresses });
    }
    /**
    * Fetches coin data based on its hash and output index.
    * @param hash - The transaction hash of the coin.
    * @param index - The output index of the coin.
    * @returns A promise resolving with the coin data.
    */
    getCoin(hash, index) {
        (0, assert_1.default)(typeof hash === 'string');
        (0, assert_1.default)(index >>> 0 === index);
        return this.get(`/coin/${hash}/${index}`);
    }
    /**
     * Retrieves transactions associated with a given address.
     * @param address - The address to query.
     * @returns A promise resolving with the transaction data.
     */
    getTxByAddress(address) {
        (0, assert_1.default)(typeof address === 'string');
        return this.get(`/tx/address/${address}`);
    }
    /**
     * Retrieves transactions associated with multiple addresses.
     * @param addresses - Array of addresses to query.
     * @returns A promise resolving with the transaction data.
     */
    getTxByAddresses(addresses) {
        (0, assert_1.default)(Array.isArray(addresses));
        return this.post('/tx/address', { addresses });
    }
    /**
    * Fetches a transaction based on its hash.
    * @param hash - The transaction hash to query.
    * @returns A promise resolving with the transaction data.
    */
    getTX(hash) {
        (0, assert_1.default)(typeof hash === 'string');
        return this.get(`/tx/${hash}`);
    }
    /**
     * Broadcasts a transaction based on its hash.
     * @param hash - The transaction hash to broadcast.
     * @returns A promise resolving with the broadcast result.
     */
    pushTX(hash) {
        (0, assert_1.default)(typeof hash === 'string');
        return this.post(`/broadcast`, { tx: hash });
    }
    /**
     * Retrieves block data based on its identifier.
     * @param block - The block hash or block height to query.
     * @returns A promise resolving with the block data.
     */
    getBlock(block) {
        (0, assert_1.default)(typeof block === 'string' || typeof block === 'number');
        return this.get(`/block/${block}`);
    }
    /**
     * Retrieves block header data based on its identifier.
     * @param block - The block hash or block height to query.
     * @returns A promise resolving with the block header data.
     */
    getBlockHeader(block) {
        (0, assert_1.default)(typeof block === 'string' || typeof block === 'number');
        return this.get(`/header/${block}`);
    }
    /**
     * Fetches filter data based on its identifier.
     * @param filter - The filter hash or filter height to query.
     * @returns A promise resolving with the filter data.
     */
    getFilter(filter) {
        (0, assert_1.default)(typeof filter === 'string' || typeof filter === 'number');
        return this.get(`/filter/${filter}`);
    }
    /**
     * Broadcasts a given transaction.
     * @param tx - The transaction string to broadcast.
     * @returns A promise resolving with the broadcast result.
     */
    broadcast(tx) {
        (0, assert_1.default)(typeof tx === 'string');
        return this.post('/broadcast', { tx });
    }
    /**
     * Resets the blockchain to a specific height.
     * @param height - The block height to reset to.
     * @returns A promise resolving with the reset result.
     */
    reset(height) {
        return this.post('/reset', { height });
    }
    /**
     * Subscribes to watch changes on the blockchain.
     * @returns A promise resolving with the subscription result.
     */
    watchChain() {
        return this.call('watch chain');
    }
    /**
    * Subscribes to watch changes in the mempool.
    * @returns A promise resolving with the subscription result.
    */
    watchMempool() {
        return this.call('watch mempool');
    }
    /**
     * Retrieves the current tip of the blockchain.
     * @returns A promise resolving with the tip data.
     */
    getTip() {
        return this.call('get tip');
    }
    /**
     * Fetches block entry data based on its identifier.
     * @param block - The block hash to query.
     * @returns A promise resolving with the block entry data.
     */
    getEntry(block) {
        return this.call('get entry', block);
    }
}
exports.default = BcoinRpc;
//# sourceMappingURL=index.js.map