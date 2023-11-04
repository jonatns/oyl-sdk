"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountManager = void 0;
const hdKeyring_1 = require("./hdKeyring");
const accounts_1 = require("./accounts");
const interface_1 = require("../shared/interface");
const bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
const genMnemonic = new bitcore_mnemonic_1.default(bitcore_mnemonic_1.default.Words.ENGLISH).toString();
const customPaths = {
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
};
class AccountManager {
    /**
     * Initializes a new AccountManager instance with the given options.
     *
     * @param options - Configuration options for the AccountManager.
     */
    constructor(options) {
        this.mnemonic = genMnemonic;
        this.mnemonic = options === null || options === void 0 ? void 0 : options.mnemonic;
        this.activeIndexes = options === null || options === void 0 ? void 0 : options.activeIndexes;
        this.hdPath = (options === null || options === void 0 ? void 0 : options.customPath)
            ? customPaths[options.customPath]
            : customPaths.oyl;
        this.taprootKeyring = new hdKeyring_1.HdKeyring({
            mnemonic: this.mnemonic || genMnemonic,
            hdPath: this.hdPath.taprootPath,
            activeIndexes: this.activeIndexes,
        });
        this.segwitKeyring = new hdKeyring_1.HdKeyring({
            mnemonic: this.mnemonic || genMnemonic,
            hdPath: this.hdPath.segwitPath,
            activeIndexes: this.activeIndexes,
        });
    }
    /**
     * Initializes taproot and segwit accounts by generating the necessary addresses.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the initialized accounts.
     */
    initializeAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.taprootKeyring.addAccounts(1);
            yield this.segwitKeyring.addAccounts(1);
            const taprootAcccounts = yield this.taprootKeyring.getAccounts();
            const segwitAccounts = yield this.segwitKeyring.getAccounts();
            const taprootAddresses = [];
            const segwitAddresses = [];
            taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAcccounts[0], interface_1.AddressType.P2TR));
            segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[0], this.hdPath.segwitAddressType));
            const ret = {
                taproot: {
                    taprootKeyring: this.taprootKeyring,
                    taprootAddresses,
                },
                segwit: {
                    segwitKeyring: this.segwitKeyring,
                    segwitAddresses,
                },
                initializedFrom: this.hdPath.initializedFrom,
                mnemonic: genMnemonic,
            };
            return ret;
        });
    }
    /**
     * Recovers existing accounts by fetching and converting the public keys to addresses.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the recovered accounts.
     */
    recoverAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const taprootAcccounts = yield this.taprootKeyring.getAccounts();
            const segwitAccounts = yield this.segwitKeyring.getAccounts();
            const taprootAddresses = [];
            const segwitAddresses = [];
            let i = 0;
            while (i < taprootAcccounts.length) {
                taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAcccounts[i], interface_1.AddressType.P2TR));
                segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[i], this.hdPath.segwitAddressType));
                i++;
            }
            const ret = {
                taproot: {
                    taprootKeyring: this.taprootKeyring,
                    taprootAddresses,
                },
                segwit: {
                    segwitKeyring: this.segwitKeyring,
                    segwitAddresses,
                },
                initializedFrom: this.hdPath.initializedFrom,
                mnemonic: this.mnemonic,
            };
            return ret;
        });
    }
    /**
     * Adds a new account for both taproot and segwit and returns the updated account information.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the updated accounts.
     */
    addAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.taprootKeyring.addAccounts(1);
            yield this.segwitKeyring.addAccounts(1);
            const taprootAcccounts = yield this.taprootKeyring.getAccounts();
            const segwitAccounts = yield this.segwitKeyring.getAccounts();
            console.log(taprootAcccounts);
            const taprootAddresses = [];
            const segwitAddresses = [];
            let i = 0;
            while (i < taprootAcccounts.length) {
                taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAcccounts[i], interface_1.AddressType.P2TR));
                segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[i], this.hdPath.segwitAddressType));
                i++;
            }
            const ret = {
                taproot: {
                    taprootKeyring: this.taprootKeyring,
                    taprootAddresses,
                },
                segwit: {
                    segwitKeyring: this.segwitKeyring,
                    segwitAddresses,
                },
                initializedFrom: this.hdPath.initializedFrom,
                mnemonic: this.mnemonic,
            };
            return ret;
        });
    }
}
exports.AccountManager = AccountManager;
//# sourceMappingURL=accountsManager.js.map