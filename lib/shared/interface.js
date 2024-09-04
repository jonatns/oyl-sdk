"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressNameToType = exports.internalAddressTypeToName = exports.addressTypeToName = exports.Providers = exports.AssetType = exports.AddressType = exports.RarityEnum = exports.belscoin = void 0;
exports.belscoin = {
    networks: {
        bellcoin: {
            messagePrefix: 'Bells Signed Message:\n',
            bech32: 'bel',
            bip32: {
                public: 0x043587cf,
                private: 0x04358394,
            },
            pubKeyHash: 25,
            scriptHash: 30,
            wif: 0x99,
        },
        testnet: {
            messagePrefix: 'Bells Signed Message:\n',
            bech32: 'tbel',
            bip32: {
                public: 0x043587cf,
                private: 0x04358394,
            },
            pubKeyHash: 33,
            scriptHash: 22,
            wif: 0xef,
        },
    },
};
var RarityEnum;
(function (RarityEnum) {
    RarityEnum["COMMON"] = "common";
    RarityEnum["UNCOMMON"] = "uncommon";
    RarityEnum["RARE"] = "rare";
    RarityEnum["EPIC"] = "epic";
    RarityEnum["LEGENDARY"] = "legendary";
    RarityEnum["MYTHIC"] = "mythic";
})(RarityEnum = exports.RarityEnum || (exports.RarityEnum = {}));
var AddressType;
(function (AddressType) {
    AddressType[AddressType["P2PKH"] = 0] = "P2PKH";
    AddressType[AddressType["P2TR"] = 1] = "P2TR";
    AddressType[AddressType["P2SH_P2WPKH"] = 2] = "P2SH_P2WPKH";
    AddressType[AddressType["P2WPKH"] = 3] = "P2WPKH";
})(AddressType = exports.AddressType || (exports.AddressType = {}));
var AssetType;
(function (AssetType) {
    AssetType[AssetType["BRC20"] = 0] = "BRC20";
    AssetType[AssetType["COLLECTIBLE"] = 1] = "COLLECTIBLE";
    AssetType[AssetType["RUNES"] = 2] = "RUNES";
})(AssetType = exports.AssetType || (exports.AssetType = {}));
var Providers;
(function (Providers) {
    Providers[Providers["bcoin"] = 0] = "bcoin";
    Providers[Providers["oyl"] = 1] = "oyl";
    Providers[Providers["electrum"] = 2] = "electrum";
})(Providers = exports.Providers || (exports.Providers = {}));
exports.addressTypeToName = {
    p2pkh: 'legacy',
    p2tr: 'taproot',
    p2sh: 'nested-segwit',
    p2wpkh: 'segwit',
};
exports.internalAddressTypeToName = {
    [AddressType.P2PKH]: 'legacy',
    [AddressType.P2TR]: 'taproot',
    [AddressType.P2SH_P2WPKH]: 'nested-segwit',
    [AddressType.P2WPKH]: 'segwit',
};
exports.addressNameToType = {
    legacy: 'p2pkh',
    taproot: 'p2tr',
    'nested-segwit': 'p2sh-p2wpkh',
    segwit: 'p2wpkh',
};
//# sourceMappingURL=interface.js.map