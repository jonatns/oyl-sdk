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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const interface_1 = require("../shared/interface");
const utils_1 = require("../shared/utils");
const bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
const oylib_1 = require("../oylib");
const publicKeyToAddress = (publicKey, type, network) => {
    if (!publicKey)
        return null;
    const pubkey = Buffer.from(publicKey, 'hex');
    if (type === interface_1.AddressType.P2PKH) {
        const { address } = bitcoin.payments.p2pkh({
            pubkey,
            network,
        });
        return address || null;
    }
    else if (type === interface_1.AddressType.P2WPKH) {
        const { address } = bitcoin.payments.p2wpkh({
            pubkey,
            network,
        });
        return address || null;
    }
    else if (type === interface_1.AddressType.P2SH_P2WPKH) {
        const { address } = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey, network }),
        });
        return address || null;
    }
    else if (type === interface_1.AddressType.P2TR) {
        const { address } = bitcoin.payments.p2tr({
            internalPubkey: pubkey.slice(1, 33),
            network,
        });
        return address || null;
    }
    else {
        return null;
    }
};
const hdPathToAddressType = (hdPath) => {
    const matchesPath = true;
    switch (matchesPath) {
        case hdPath.includes("m/84'/0'/0'/"):
            return interface_1.AddressType.P2WPKH;
        case hdPath.includes("m/49'/0'/0'/"):
            return interface_1.AddressType.P2SH_P2WPKH;
        case hdPath.includes("m/86'/0'/0'/"):
            return interface_1.AddressType.P2TR;
        case hdPath.includes("m/44'/0'/0'/"):
            return interface_1.AddressType.P2PKH;
        default:
            throw new Error('unknown hd path');
    }
};
class Account {
    mnemonicObject;
    constructor(mnemonic) {
        this.mnemonicObject = new bitcore_mnemonic_1.default(mnemonic);
    }
    mnemonicToAccount(network, hdPath) {
        const child = this.mnemonicObject
            .toHDPrivateKey(undefined, network)
            .deriveChild(hdPath);
        const ecpair = utils_1.ECPair.fromPrivateKey(child.privateKey.toBuffer());
        const pubkey = ecpair.publicKey.toString('hex');
        const addressType = hdPathToAddressType(hdPath);
        const addressKeyValue = interface_1.internalAddressTypeToName[addressType];
        const btcAddress = publicKeyToAddress(pubkey, addressType, network);
        return {
            pubkey: pubkey,
            addressType: interface_1.addressNameToType[addressKeyValue],
            btcAddress: btcAddress,
        };
    }
    allAddresses(network, accountIndex) {
        let paths = [
            oylib_1.SEGWIT_HD_PATH,
            oylib_1.TAPROOT_HD_PATH,
            oylib_1.NESTED_SEGWIT_HD_PATH,
            oylib_1.LEGACY_HD_PATH,
        ];
        if (accountIndex) {
            paths = [
                "m/84'/0'/0'/" + String(accountIndex),
                "m/49'/0'/0'/" + String(accountIndex),
                "m/86'/0'/0'/" + String(accountIndex),
                "m/44'/0'/0'/" + String(accountIndex),
            ];
        }
        const mnemonic = this.mnemonicObject;
        let allAccounts = {};
        for (const path of paths) {
            const hdObject = mnemonic
                .toHDPrivateKey(undefined, network)
                .deriveChild(path);
            const ecpair = utils_1.ECPair.fromPrivateKey(hdObject.privateKey.toBuffer());
            const pubkey = ecpair.publicKey.toString('hex');
            const addressType = hdPathToAddressType(path);
            const addressKeyValue = interface_1.internalAddressTypeToName[addressType];
            const btcAddress = publicKeyToAddress(pubkey, addressType, network);
            const additionalSingleAccount = {
                [addressKeyValue]: {
                    pubkey: pubkey,
                    addressType: interface_1.addressNameToType[addressKeyValue],
                    btcAddress: btcAddress,
                },
            };
            allAccounts = { ...allAccounts, ...additionalSingleAccount };
        }
        return allAccounts;
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map