"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = exports.AddressType = void 0;
var AddressType;
(function (AddressType) {
    AddressType[AddressType["P2PKH"] = 0] = "P2PKH";
    AddressType[AddressType["P2TR"] = 1] = "P2TR";
    AddressType[AddressType["P2SH_P2WPKH"] = 2] = "P2SH_P2WPKH";
    AddressType[AddressType["P2WPKH"] = 3] = "P2WPKH";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
var Providers;
(function (Providers) {
    Providers[Providers["bcoin"] = 0] = "bcoin";
    Providers[Providers["oyl"] = 1] = "oyl";
    Providers[Providers["electrum"] = 2] = "electrum";
})(Providers = exports.Providers || (exports.Providers = {}));
//# sourceMappingURL=interface.js.map