"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWrapAddress = exports.fetchSigner = void 0;
const utils_1 = require("../shared/utils");
const invoke_1 = require("alkanes/lib/invoke");
const alkanes_1 = require("../rpclient/alkanes");
const stripHexPrefix = (v) => v.substr(0, 2) === '0x' ? v.substr(2) : v;
let id = 0;
const fetchSigner = async (provider) => {
    const url = alkanes_1.metashrew.get() || provider.alkanes.alkanesUrl;
    const payload = (0, invoke_1.encodeSimulateRequest)({
        alkanes: [],
        height: 880000n,
        vout: 0,
        txindex: 0,
        target: {
            block: 32n,
            tx: 0n
        },
        inputs: [103n],
        pointer: 0,
        refundPointer: 0,
        block: '0x',
        transaction: '0x'
    });
    const responseText = await (await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            method: 'metashrew_view',
            params: ["simulate", payload, "latest"],
            id: id++,
            jsonrpc: "2.0"
        })
    })).text();
    const response = JSON.parse(responseText);
    return Buffer.from(stripHexPrefix((0, invoke_1.decodeSimulateResponse)(response.result).execution.data), 'hex');
};
exports.fetchSigner = fetchSigner;
const getWrapAddress = async (provider) => {
    return (0, utils_1.internalPubKeyToTaprootAddress)(await (0, exports.fetchSigner)(provider), provider.network);
};
exports.getWrapAddress = getWrapAddress;
//# sourceMappingURL=subfrost.js.map