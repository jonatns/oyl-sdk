"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceName = exports.Marketplaces = void 0;
var Marketplaces;
(function (Marketplaces) {
    Marketplaces[Marketplaces["UNISAT"] = 0] = "UNISAT";
    Marketplaces[Marketplaces["OKX"] = 1] = "OKX";
    Marketplaces[Marketplaces["ORDINALS_WALLET"] = 2] = "ORDINALS_WALLET";
})(Marketplaces = exports.Marketplaces || (exports.Marketplaces = {}));
exports.marketplaceName = {
    unisat: Marketplaces.UNISAT,
    okx: Marketplaces.OKX,
    'ordinals-wallet': Marketplaces.ORDINALS_WALLET,
};
//# sourceMappingURL=types.js.map