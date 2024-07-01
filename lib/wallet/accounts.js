"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressFormats = exports.importMnemonic = exports.isValidAddress = exports.publicKeyToAddress = exports.createWallet = void 0;
const tslib_1 = require("tslib");
/*
*
*
The  parent key should be able to be derived sequentially. The UI can select/change
the path parameters (e.g "44"/"49"/"86")
// */
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const hdKeyring_1 = require("./hdKeyring");
const interface_1 = require("../shared/interface");
function createWallet(hdPathString, type, network) {
    // Create a new instance of HdKeyring with the provided hdPathString
    const keyring = new hdKeyring_1.HdKeyring({ hdPath: hdPathString, network });
    // Add a single account to the keyring
    keyring.addAccounts(1, network);
    // Get the first account public key
    const accounts = keyring.getAccounts();
    const pubkey = accounts[0];
    const address = publicKeyToAddress(pubkey, type, network);
    if (address == null)
        throw Error('Invalid publickey or address type');
    const fullPayload = {};
    fullPayload['keyring'] = keyring;
    fullPayload['address'] = address;
    return fullPayload;
}
exports.createWallet = createWallet;
function publicKeyToAddress(publicKey, type, network) {
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
}
exports.publicKeyToAddress = publicKeyToAddress;
function isValidAddress(address, network) {
    let error;
    try {
        bitcoin.address.toOutputScript(address, network);
    }
    catch (e) {
        error = e;
    }
    if (error) {
        return false;
    }
    else {
        return true;
    }
}
exports.isValidAddress = isValidAddress;
async function importMnemonic(mnemonic, path, type, network) {
    const keyring = new hdKeyring_1.HdKeyring({
        mnemonic: mnemonic,
        hdPath: path,
        network,
    });
    // Add a single account to the keyring
    await keyring.addAccounts(1, network);
    // Get the first account public key
    const accounts = await keyring.getAccounts();
    const pubkey = accounts[0];
    const address = publicKeyToAddress(pubkey, type, network);
    if (address == null)
        throw Error('Invalid publickey or address type');
    const fullPayload = {};
    fullPayload['keyring'] = keyring;
    fullPayload['address'] = address;
    return fullPayload;
}
exports.importMnemonic = importMnemonic;
exports.addressFormats = {
    mainnet: {
        p2pkh: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        p2sh: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        p2wpkh: /^(bc1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
        p2tr: /^(bc1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
    },
    testnet: {
        p2pkh: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        p2sh: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        p2wpkh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
        p2tr: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
    },
    regtest: {
        p2pkh: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        p2sh: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        p2wpkh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
        p2tr: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
    },
};
//# sourceMappingURL=accounts.js.map