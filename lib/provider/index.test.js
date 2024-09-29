"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const _1 = require(".");
const dotenv = tslib_1.__importStar(require("dotenv"));
dotenv.config();
describe('Provider', () => {
    it('should instantiate a new provider with the specified api url', () => {
        const provider = new _1.Provider({
            url: 'https://mainnet.sandshrew.io',
            projectId: process.env.SANDSHREW_PROJECT_ID,
            network: bitcoinjs_lib_1.networks.bitcoin,
            networkType: 'mainnet',
            apiUrl: 'http://localhost:9000',
        });
        expect(provider).toBeDefined();
        expect(provider.api.toObject().host).toBe('http://localhost:9000');
    });
});
//# sourceMappingURL=index.test.js.map