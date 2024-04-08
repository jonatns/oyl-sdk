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
exports.AccountManager = exports.customPaths = void 0;
const hdKeyring_1 = require("./hdKeyring");
const accounts_1 = require("./accounts");
const interface_1 = require("../shared/interface");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
exports.customPaths = {
    oyl: {
        taprootPath: "m/86'/0'/0'/0",
        initializedFrom: 'oyl',
        segwitPath: "m/84'/0'/0'/0",
        segwitAddressType: interface_1.AddressType.P2WPKH,
    },
    xverse: {
        taprootPath: "m/86'/0'/0'/0",
        initializedFrom: 'xverse',
        segwitPath: "m/49'/0'/0'/0",
        segwitAddressType: interface_1.AddressType.P2SH_P2WPKH,
    },
    leather: {
        taprootPath: "m/86'/0'/0'/0",
        segwitPath: "m/84'/0'/0'/0",
        initializedFrom: 'leather',
        segwitAddressType: interface_1.AddressType.P2WPKH,
    },
    unisat: {
        taprootPath: "m/86'/0'/0'/0",
        segwitPath: "m/84'/0'/0'/0",
        initializedFrom: 'unisat',
        segwitAddressType: interface_1.AddressType.P2WPKH,
    },
    testnet: {
        taprootPath: "m/86'/1'/0'/0",
        initializedFrom: 'testnet',
        segwitPath: "m/84'/1'/0'/0",
        segwitAddressType: interface_1.AddressType.P2WPKH,
    },
};
class AccountManager {
    mnemonic;
    taprootKeyring;
    segwitKeyring;
    activeIndexes;
    network;
    hdPath;
    /**
     * Initializes a new AccountManager instance with the given options.
     *
     * @param options - Configuration options for the AccountManager.
     */
    constructor(options) {
        this.mnemonic =
            options?.mnemonic || new bitcore_mnemonic_1.default(bitcore_mnemonic_1.default.Words.ENGLISH).toString();
        this.activeIndexes = options?.activeIndexes;
        this.network = options.network;
        this.hdPath = options.customPath
            ? exports.customPaths[options.customPath]
            : exports.customPaths.oyl;
        if (this.network === bitcoin.networks.testnet) {
            this.hdPath =
                options.customPath === 'unisat'
                    ? exports.customPaths.unisat
                    : exports.customPaths.testnet;
        }
        this.taprootKeyring = new hdKeyring_1.HdKeyring({
            mnemonic: this.mnemonic,
            hdPath: this.hdPath.taprootPath,
            activeIndexes: this.activeIndexes,
            network: this.network,
        });
        this.segwitKeyring = new hdKeyring_1.HdKeyring({
            mnemonic: this.mnemonic,
            hdPath: this.hdPath.segwitPath,
            activeIndexes: this.activeIndexes,
            network: this.network,
        });
    }
    /**
     * Initializes taproot and segwit accounts by generating the necessary addresses.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the initialized accounts.
     */
    async initializeAccounts() {
        await this.taprootKeyring.addAccounts(1);
        await this.segwitKeyring.addAccounts(1);
        const taprootAccounts = await this.taprootKeyring.getAccounts();
        const segwitAccounts = await this.segwitKeyring.getAccounts();
        const taprootAddresses = [];
        const segwitAddresses = [];
        taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAccounts[0], interface_1.AddressType.P2TR, this.network));
        segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[0], this.hdPath.segwitAddressType, this.network));
        const ret = {
            taproot: {
                taprootKeyring: this.taprootKeyring,
                taprootPubKey: taprootAccounts[0].toString('hex'),
                taprootAddresses,
            },
            segwit: {
                segwitKeyring: this.segwitKeyring,
                segwitPubKey: taprootAccounts[0].toString('hex'),
                segwitAddresses,
            },
            initializedFrom: this.hdPath.initializedFrom,
            mnemonic: this.mnemonic,
        };
        return ret;
    }
    /**
     * Recovers existing accounts by fetching and converting the public keys to addresses.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the recovered accounts.
     */
    async recoverAccounts() {
        const taprootAccounts = await this.taprootKeyring.getAccounts();
        const segwitAccounts = await this.segwitKeyring.getAccounts();
        const taprootAddresses = [];
        const segwitAddresses = [];
        let i = 0;
        while (i < taprootAccounts.length) {
            taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAccounts[i], interface_1.AddressType.P2TR, this.network));
            segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[i], this.hdPath.segwitAddressType, this.network));
            i++;
        }
        const ret = {
            taproot: {
                taprootKeyring: this.taprootKeyring,
                taprootPubKey: taprootAccounts[0].toString('hex'),
                taprootAddresses,
            },
            segwit: {
                segwitKeyring: this.segwitKeyring,
                segwitPubKey: segwitAccounts[0].toString('hex'),
                segwitAddresses,
            },
            initializedFrom: this.hdPath.initializedFrom,
            mnemonic: this.mnemonic,
        };
        return ret;
    }
    /**
     * Adds a new account for both taproot and segwit and returns the updated account information.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the updated accounts.
     */
    async addAccount() {
        await this.taprootKeyring.addAccounts(1);
        await this.segwitKeyring.addAccounts(1);
        const taprootAccounts = await this.taprootKeyring.getAccounts();
        const segwitAccounts = await this.segwitKeyring.getAccounts();
        const taprootAddresses = [];
        const segwitAddresses = [];
        let i = 0;
        while (i < taprootAccounts.length) {
            taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAccounts[i], interface_1.AddressType.P2TR, this.network));
            segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[i], this.hdPath.segwitAddressType, this.network));
            i++;
        }
        const ret = {
            taproot: {
                taprootKeyring: this.taprootKeyring,
                taprootPubKey: taprootAccounts[0].toString('hex'),
                taprootAddresses,
            },
            segwit: {
                segwitKeyring: this.segwitKeyring,
                segwitPubKey: segwitAccounts[0].toString('hex'),
                segwitAddresses,
            },
            initializedFrom: this.hdPath.initializedFrom,
            mnemonic: this.mnemonic,
        };
        return ret;
    }
}
exports.AccountManager = AccountManager;
//# sourceMappingURL=accountsManager.js.map