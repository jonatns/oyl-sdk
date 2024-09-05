"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOffer = void 0;
const unisat_1 = require("./unisat/unisat");
const okx_1 = require("./okx/okx");
const types_1 = require("./types");
const ordinals_wallet_1 = require("./ordinals-wallet/ordinals-wallet");
async function processOffer(options) {
    let swapResponse;
    switch (types_1.marketplaceName[options.offer.marketplace]) {
        case types_1.Marketplaces.UNISAT:
            swapResponse = await (0, unisat_1.unisatSwap)(options);
            break;
        case types_1.Marketplaces.ORDINALS_WALLET:
            swapResponse = await (0, ordinals_wallet_1.ordinalWalletSwap)(options);
            break;
        case types_1.Marketplaces.OKX:
            swapResponse = await (0, okx_1.okxSwap)(options);
            break;
    }
    return swapResponse;
}
exports.processOffer = processOffer;
//# sourceMappingURL=swap.js.map