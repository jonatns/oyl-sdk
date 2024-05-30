"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNetworkOptions = exports.getBrc20Data = exports.MAXIMUM_FEE = exports.maximumScriptBytes = exports.UTXO_DUST = void 0;
exports.UTXO_DUST = 546;
exports.maximumScriptBytes = 520;
exports.MAXIMUM_FEE = 5000000;
const getBrc20Data = ({ amount, tick, }) => ({
    mediaContent: `{"p":"brc-20","op":"transfer","tick":"${tick}","amt":"${amount}"}`,
    mediaType: 'text/plain',
});
exports.getBrc20Data = getBrc20Data;
exports.defaultNetworkOptions = {
    mainnet: {
        baseUrl: 'https://mainnet.sandshrew.io',
        version: 'v1',
        projectId: process.env.SANDSHREW_PROJECT_ID,
        network: 'mainnet',
        apiUrl: "https://api.oyl.gg"
    },
    testnet: {
        baseUrl: 'https://testnet.sandshrew.io',
        version: 'v1',
        projectId: process.env.SANDSHREW_PROJECT_ID,
        network: 'testnet',
        apiUrl: "https://api.oyl.gg"
    },
    regtest: {
        baseUrl: 'http://localhost:3000',
        version: 'v1',
        projectId: 'regtest',
        network: 'regtest',
        apiUrl: "https://api.oyl.gg"
    },
    signet: {
        baseUrl: 'https://signet.sandshrew.io',
        version: 'v1',
        projectId: process.env.SANDSHREW_PROJECT_ID,
        network: 'testnet',
        apiUrl: "https://api.oyl.gg"
    },
};
//# sourceMappingURL=constants.js.map