"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const account_1 = require("../account/account");
const interface_1 = require("./interface");
const utils_1 = require("./utils");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
describe('Shared utils', () => {
    it('getAddressType returns the right address type for an address', () => {
        const account = (0, account_1.mnemonicToAccount)({
            mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            opts: { index: 0, network: bitcoin.networks.regtest },
        });
        expect((0, utils_1.getAddressType)(account.nativeSegwit.address)).toBe(interface_1.AddressType.P2WPKH);
        expect((0, utils_1.getAddressType)(account.nestedSegwit.address)).toBe(interface_1.AddressType.P2SH_P2WPKH);
        expect((0, utils_1.getAddressType)(account.taproot.address)).toBe(interface_1.AddressType.P2TR);
        expect((0, utils_1.getAddressType)(account.legacy.address)).toBe(interface_1.AddressType.P2PKH);
        expect((0, utils_1.getAddressType)('Not an address')).toBeNull();
    });
    it('getAddressKey returns the right address key for an address', () => {
        const account = (0, account_1.mnemonicToAccount)({
            mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            opts: { index: 0, network: bitcoin.networks.regtest },
        });
        expect((0, utils_1.getAddressKey)(account.nativeSegwit.address)).toBe('nativeSegwit');
        expect((0, utils_1.getAddressKey)(account.nestedSegwit.address)).toBe('nestedSegwit');
        expect((0, utils_1.getAddressKey)(account.taproot.address)).toBe('taproot');
        expect((0, utils_1.getAddressKey)(account.legacy.address)).toBe('legacy');
        expect((0, utils_1.getAddressKey)('Not an address')).toBeNull();
    });
});
//# sourceMappingURL=utils.test.js.map