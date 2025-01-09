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
    async getAlkanesByHeight({ height, protocolTag = '1', }) {
        return (await this._call('alkanes_protorunesbyheight', [
            {
                height,
                protocolTag,
            },
        ]));
    }
    async getAlkanesByAddress({ address, protocolTag = '1', name, }) {
        const ret = await this._call('alkanes_protorunesbyaddress', [
            {
                address,
                protocolTag,
            },
        ]);
        const alkanesList = ret.outpoints.filter((outpoint) => outpoint.runes.length > 0);
        if (name) {
            return alkanesList.flatMap((outpoints) => outpoints.runes.filter((item) => item.rune.name === name));
        }
        return alkanesList;
    }
    async trace(request) {
        request.txid = Buffer.from(Array.from(Buffer.from(request.txid, 'hex')).reverse()).toString('hex');
        const ret = await this._call('alkanes_trace', [request]);
        return await ret;
    }
    async simulate(request) {
        const ret = await this._call('alkanes_simulate', [request]);
        const parsed = this.parseSimulateReturn(ret.execution.data);
        ret.parsed = parsed;
        return ret;
    }
    async getAlkanesByOutpoint({ txid, vout, protocolTag = '1', }) {
        return await this._call('alkanes_protorunesbyoutpoint', [
            {
                txid: '0x' +
                    Buffer.from(Array.from(Buffer.from(txid, 'hex')).reverse()).toString('hex'),
                vout,
                protocolTag,
            },
        ]);
    }
    async getAlkanes(amount) {
        const opcodes = ['99', '100', '101', '102', '103'];
        const opcodesHRV = [
            'name',
            'symbol',
            'total_supply',
            'cap',
            'minted',
        ];
        const alkaneResults = [];
        for (let i = 1; i < amount; i++) {
            const alkaneData = {};
            let hasValidResult = false;
            for (let j = 0; j < opcodes.length; j++) {
                try {
                    const result = await this.simulate({
                        target: { block: '2', tx: i.toString() },
                        alkanes: [],
                        transaction: '0x',
                        block: '0x',
                        height: '20000',
                        txindex: 0,
                        inputs: [opcodes[j]],
                        pointer: 0,
                        refundPointer: 0,
                        vout: 0,
                    });
                    if (result.status === 0) {
                        alkaneData[opcodesHRV[j]] = result.parsed.le;
                        if (opcodesHRV[j] === 'name' || opcodesHRV[j] === 'symbol') {
                            alkaneData[opcodesHRV[j]] = result.parsed.string;
                        }
                        hasValidResult = true;
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
            if (hasValidResult) {
                alkaneResults.push(alkaneData);
            }
        }
        return alkaneResults;
    }
    parseSimulateReturn(v) {
        if (v === '0x') {
            return 'invalid';
        }
        const stripHexPrefix = (v) => (v.startsWith('0x') ? v.slice(2) : v);
        const addHexPrefix = (v) => '0x' + stripHexPrefix(v);
        let decodedString;
        try {
            decodedString = Buffer.from(stripHexPrefix(v), 'hex').toString('utf8');
            if (/[\uFFFD]/.test(decodedString)) {
                throw new Error('Invalid UTF-8 string');
            }
        }
        catch (err) {
            decodedString = addHexPrefix(v);
        }
        return {
            string: decodedString,
            bytes: addHexPrefix(v),
            le: BigInt(addHexPrefix(Buffer.from(Array.from(Buffer.from(stripHexPrefix(v), 'hex')).reverse()).toString('hex'))).toString(),
            be: BigInt(addHexPrefix(v)).toString(),
        };
    }
}
exports.AlkanesRpc = AlkanesRpc;
//# sourceMappingURL=alkanes.js.map