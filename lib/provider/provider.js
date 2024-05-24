"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const sandshrew_1 = require("../rpclient/sandshrew");
const esplora_1 = require("../rpclient/esplora");
const ord_1 = require("../rpclient/ord");
class Provider {
    sandshrew;
    esplora;
    ord;
    constructor(url) {
        this.sandshrew = new sandshrew_1.SandshrewBitcoinClient(url);
        this.esplora = new esplora_1.EsploraRpc(url);
        this.ord = new ord_1.OrdRpc(url);
    }
}
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map