"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const sandshrew_1 = require("./sandshrew");
const esplora_1 = require("./esplora");
class Provider {
    constructor(url) {
        this.sandshrew = new sandshrew_1.SandshrewBitcoinClient(url);
        this.esplora = new esplora_1.EsploraRpc(url);
    }
}
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map