"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlkanesRpc = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
class AlkanesRpc {
    alkanesUrl;
    constructor(url) {
        this.alkanesUrl = url;
    }
    async _call(method, params = []) {
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
            const response = await (0, node_fetch_1.default)(this.alkanesUrl, requestOptions);
            const responseData = await response.json();
            if (responseData.error) {
                console.error('Alkanes JSON-RPC Error:', responseData.error);
                throw new Error(responseData.error);
            }
            return responseData.result;
        }
        catch (error) {
            console.error('Request Error:', error);
            throw error;
        }
    }
    async getAlkanesByHeight({ blockHeight, protocolTag = '1', }) {
        return (await this._call('alkanes_protorunesbyheight', [
            {
                blockHeight,
                protocolTag,
            },
        ]));
    }
    async getAlkanesByAddress({ address, protocolTag = '1', }) {
        return (await this._call('alkanes_protorunesbyaddress', [
            {
                address,
                protocolTag,
            },
        ]));
    }
    async simulate(request) {
        return await this._call('alkanes_simulate', [request]);
    }
    async getAlkanesByOutpoint({ txid, vout, protocolTag = '1', }) {
        return await this._call('alkanes_protorunesbyoutpoint', [
            { txid: '0x' + txid, vout, protocolTag },
        ]);
    }
}
exports.AlkanesRpc = AlkanesRpc;
//# sourceMappingURL=alkanes.js.map