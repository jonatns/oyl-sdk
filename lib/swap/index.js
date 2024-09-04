"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOffer = void 0;
const unisat_1 = require("./unisat/unisat");
const okx_1 = require("./okx");
const types_1 = require("./types");
const ordinals_wallet_1 = require("./ordinals-wallet/ordinals-wallet");
async function processOffer(options) {
    switch (types_1.marketplaceName[options.offer.marketplace]) {
        case types_1.Marketplaces.UNISAT:
            return await (0, unisat_1.unisatSwap)(options);
        case types_1.Marketplaces.ORDINALS_WALLET:
            return await (0, ordinals_wallet_1.ordinalWalletSwap)(options);
        case types_1.Marketplaces.OKX:
            return await (0, okx_1.okxSwap)(options);
    }
}
exports.processOffer = processOffer;
//# sourceMappingURL=index.js.map