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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountManager = void 0;
const hdKeyring_1 = require("./hdKeyring");
const accounts_1 = require("./accounts");
const interface_1 = require("../shared/interface");
class AccountManager {
    constructor(options) {
        this.taprootPath = "m/86'/0'/0'/0";
        this.segwitPath = "m/84/0'/0'/0";
        this.mnemonic = options === null || options === void 0 ? void 0 : options.mnemonic;
        this.activeIndexes = options === null || options === void 0 ? void 0 : options.activeIndexes;
        this.taprootKeyring = new hdKeyring_1.HdKeyring({ mnemonic: this.mnemonic, hdPath: this.taprootPath, activeIndexes: this.activeIndexes });
        this.segwitKeyring = new hdKeyring_1.HdKeyring({ mnemonic: this.mnemonic, hdPath: this.segwitPath, activeIndexes: this.activeIndexes });
    }
    initializeAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.taprootKeyring.addAccounts(1);
            yield this.segwitKeyring.addAccounts(1);
            const taprootAcccounts = yield this.taprootKeyring.getAccounts();
            const segwitAccounts = yield this.segwitKeyring.getAccounts();
            const taprootAddresses = [];
            const segwitAddresses = [];
            taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAcccounts[0], interface_1.AddressType.P2TR));
            segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[0], interface_1.AddressType.P2WPKH));
            const ret = {
                taproot: {
                    taprootKeyring: this.taprootKeyring,
                    taprootAddresses
                },
                segwit: {
                    segwitKeyring: this.segwitKeyring,
                    segwitAddresses
                },
                mnemonic: this.mnemonic
            };
            return ret;
        });
    }
    recoverAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const taprootAcccounts = yield this.taprootKeyring.getAccounts();
            const segwitAccounts = yield this.segwitKeyring.getAccounts();
            const taprootAddresses = [];
            const segwitAddresses = [];
            let i = 0;
            while (i < taprootAcccounts.length) {
                taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAcccounts[i], interface_1.AddressType.P2TR));
                segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[i], interface_1.AddressType.P2WPKH));
                i++;
            }
            const ret = {
                taproot: {
                    taprootKeyring: this.taprootKeyring,
                    taprootAddresses
                },
                segwit: {
                    segwitKeyring: this.segwitKeyring,
                    segwitAddresses
                },
                mnemonic: this.mnemonic
            };
            return ret;
        });
    }
    addAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.taprootKeyring.addAccounts(1);
            yield this.segwitKeyring.addAccounts(1);
            const taprootAcccounts = yield this.taprootKeyring.getAccounts();
            const segwitAccounts = yield this.segwitKeyring.getAccounts();
            const taprootAddresses = [];
            const segwitAddresses = [];
            let i = 0;
            while (i < taprootAcccounts.length) {
                taprootAddresses.push((0, accounts_1.publicKeyToAddress)(taprootAcccounts[i], interface_1.AddressType.P2TR));
                segwitAddresses.push((0, accounts_1.publicKeyToAddress)(segwitAccounts[i], interface_1.AddressType.P2WPKH));
                i++;
            }
            const ret = {
                taproot: {
                    taprootKeyring: this.taprootKeyring,
                    taprootAddresses
                },
                segwit: {
                    segwitKeyring: this.segwitKeyring,
                    segwitAddresses
                },
                mnemonic: this.mnemonic
            };
            return ret;
        });
    }
}
exports.AccountManager = AccountManager;
//# sourceMappingURL=accountsManager.js.map