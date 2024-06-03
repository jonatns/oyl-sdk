"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNetworkOptions = exports.getBrc20Data = exports.regtestMnemonic = exports.regtestOpts = exports.regtestProvider = exports.MAXIMUM_FEE = exports.maximumScriptBytes = exports.UTXO_DUST = void 0;
const provider_1 = require("../provider/provider");
const bitcoin = __importStar(require("bitcoinjs-lib"));
exports.UTXO_DUST = 546;
exports.maximumScriptBytes = 520;
exports.MAXIMUM_FEE = 5000000;
exports.regtestProvider = new provider_1.Provider({
    url: 'http://localhost:3000',
    projectId: 'regtest',
    network: bitcoin.networks.regtest,
    networkType: 'mainnet',
});
exports.regtestOpts = {
    network: bitcoin.networks.regtest,
    index: 0,
};
exports.regtestMnemonic = process.env.REGTEST1.trim();
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
        apiUrl: 'https://api.oyl.gg',
    },
    testnet: {
        baseUrl: 'https://testnet.sandshrew.io',
        version: 'v1',
        projectId: process.env.SANDSHREW_PROJECT_ID,
        network: 'testnet',
        apiUrl: 'https://api.oyl.gg',
    },
    regtest: {
        baseUrl: 'http://localhost:3000',
        version: 'v1',
        projectId: 'regtest',
        network: 'regtest',
        apiUrl: 'https://api.oyl.gg',
    },
    signet: {
        baseUrl: 'https://signet.sandshrew.io',
        version: 'v1',
        projectId: process.env.SANDSHREW_PROJECT_ID,
        network: 'signet',
        apiUrl: 'https://api.oyl.gg',
    },
};
//# sourceMappingURL=constants.js.map