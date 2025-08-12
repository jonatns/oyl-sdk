"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWrapAddress = exports.fetchFrBtcSigner = void 0;
const utils_1 = require("../shared/utils");
const stripHexPrefix = (v) => v.substr(0, 2) === '0x' ? v.substr(2) : v;
const fetchFrBtcSigner = async (request, provider) => {
    try {
        const result = await provider.alkanes.simulate(request);
        return Buffer.from(stripHexPrefix(result.parsed.string), 'hex');
    }
    catch (error) {
        console.error(`Error getting signer for wrap`, error);
    }
};
exports.fetchFrBtcSigner = fetchFrBtcSigner;
const getWrapAddress = async (provider, request) => {
    return (0, utils_1.internalPubKeyToTaprootAddress)(await (0, exports.fetchFrBtcSigner)(request, provider), provider.network);
};
exports.getWrapAddress = getWrapAddress;
//# sourceMappingURL=subfrost.js.map