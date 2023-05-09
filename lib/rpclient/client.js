"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const bcurl = require('bcurl');
const { Client } = bcurl;
class NodeClient extends Client {
    constructor(options) {
        super(options);
        this.password = options.password;
    }
    async auth() {
        await this.call('auth', this.password);
        await this.watchChain();
        await this.watchMempool();
    }
    execute(name, params) {
        return super.execute('/', name, params);
    }
    getMempool() {
        return this.get('/mempool');
    }
    getInfo() {
        return this.get('/');
    }
    getCoinsByAddress(address) {
        (0, assert_1.default)(typeof address === 'string');
        return this.get(`/coin/address/${address}`);
    }
    getCoinsByAddresses(addresses) {
        (0, assert_1.default)(Array.isArray(addresses));
        return this.post('/coin/address', { addresses });
    }
    getCoin(hash, index) {
        (0, assert_1.default)(typeof hash === 'string');
        (0, assert_1.default)((index >>> 0) === index);
        return this.get(`/coin/${hash}/${index}`);
    }
    getTXByAddress(address) {
        (0, assert_1.default)(typeof address === 'string');
        return this.get(`/tx/address/${address}`);
    }
    getTXByAddresses(addresses) {
        (0, assert_1.default)(Array.isArray(addresses));
        return this.post('/tx/address', { addresses });
    }
    getTX(hash) {
        (0, assert_1.default)(typeof hash === 'string');
        return this.get(`/tx/${hash}`);
    }
    getBlock(block) {
        (0, assert_1.default)(typeof block === 'string' || typeof block === 'number');
        return this.get(`/block/${block}`);
    }
    getBlockHeader(block) {
        (0, assert_1.default)(typeof block === 'string' || typeof block === 'number');
        return this.get(`/header/${block}`);
    }
    getFilter(filter) {
        (0, assert_1.default)(typeof filter === 'string' || typeof filter === 'number');
        return this.get(`/filter/${filter}`);
    }
    broadcast(tx) {
        (0, assert_1.default)(typeof tx === 'string');
        return this.post('/broadcast', { tx });
    }
    reset(height) {
        return this.post('/reset', { height });
    }
    watchChain() {
        return this.call('watch chain');
    }
    watchMempool() {
        return this.call('watch mempool');
    }
    getTip() {
        return this.call('get tip');
    }
    getEntry(block) {
        return this.call('get entry', block);
    }
}
exports.default = NodeClient;
//# sourceMappingURL=client.js.map