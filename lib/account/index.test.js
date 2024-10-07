"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const account_1 = require("./account");
function isAccount(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        typeof obj.taproot === 'object' &&
        typeof obj.taproot.pubkey === 'string' &&
        typeof obj.taproot.pubKeyXOnly === 'string' &&
        typeof obj.taproot.address === 'string' &&
        typeof obj.nativeSegwit === 'object' &&
        typeof obj.nativeSegwit.pubkey === 'string' &&
        typeof obj.nativeSegwit.address === 'string' &&
        typeof obj.nestedSegwit === 'object' &&
        typeof obj.nestedSegwit.pubkey === 'string' &&
        typeof obj.nestedSegwit.address === 'string' &&
        typeof obj.legacy === 'object' &&
        typeof obj.legacy.pubkey === 'string' &&
        typeof obj.legacy.address === 'string' &&
        typeof obj.spendStrategy === 'object' &&
        Array.isArray(obj.spendStrategy.addressOrder) &&
        typeof obj.spendStrategy.utxoSortGreatestToLeast === 'boolean' &&
        typeof obj.spendStrategy.changeAddress === 'string' &&
        typeof obj.network === 'object' &&
        typeof obj.network.messagePrefix === 'string' &&
        typeof obj.network.bech32 === 'string' &&
        typeof obj.network.bip32 === 'object' &&
        typeof obj.network.bip32.public === 'number' &&
        typeof obj.network.bip32.private === 'number' &&
        typeof obj.network.pubKeyHash === 'number' &&
        typeof obj.network.scriptHash === 'number' &&
        typeof obj.network.wif === 'number');
}
describe('Account Tests', () => {
    it('Generate accurate Account object', () => {
        expect(isAccount((0, account_1.mnemonicToAccount)({
            mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        }))).toBe(true);
    });
    it('generateMnemonic generates a 12 word mnemonic', () => {
        const mnemonic = (0, account_1.generateMnemonic)();
        const words = mnemonic.split(' ');
        expect(words).toHaveLength(12);
    });
    it('mnemonicToAccount does not throw an error if mnemonic is invalid', () => {
        expect(() => (0, account_1.mnemonicToAccount)({ mnemonic: 'invalid mnemonic' })).not.toThrow(Error);
    });
    it('getWalletPrivateKeys does not throw an error if mnemonic is invalid', () => {
        expect(() => (0, account_1.getWalletPrivateKeys)({ mnemonic: 'invalid mnemonic' })).not.toThrow(Error);
    });
    it('validateMnemonic returns true for valid mnemonic', () => {
        expect((0, account_1.validateMnemonic)('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')).toBeTruthy();
    });
    it('validateMnemonic returns false for invalid mnemonic', () => {
        expect((0, account_1.validateMnemonic)('invalid mnemonic')).toBeFalsy();
    });
});
//# sourceMappingURL=index.test.js.map