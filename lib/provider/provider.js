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
exports.Provider = void 0;
const sandshrew_1 = require("../rpclient/sandshrew");
const esplora_1 = require("../rpclient/esplora");
const ord_1 = require("../rpclient/ord");
const apiclient_1 = require("../apiclient");
const bitcoin = __importStar(require("bitcoinjs-lib"));
class Provider {
    sandshrew;
    esplora;
    ord;
    api;
    network;
    constructor({ url, projectId, network, networkType, version = 'v1', }) {
        let isTestnet;
        let isRegtest;
        switch (network) {
            case bitcoin.networks.testnet:
                isTestnet = true;
            case bitcoin.networks.regtest:
                isRegtest = true;
        }
        const masterUrl = `${url}/${version}/${projectId}`;
        this.sandshrew = new sandshrew_1.SandshrewBitcoinClient(masterUrl);
        this.esplora = new esplora_1.EsploraRpc(masterUrl);
        this.ord = new ord_1.OrdRpc(masterUrl);
        this.api = new apiclient_1.OylApiClient({
            network: networkType,
            host: 'https://api.oyl.gg',
            testnet: isTestnet ? true : null,
            regtest: isRegtest ? true : null,
            apiKey: projectId,
        });
        this.network = network;
    }
}
exports.Provider = Provider;
// make a switch for bitcoin js to oyl network names
//# sourceMappingURL=provider.js.map