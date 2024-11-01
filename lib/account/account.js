"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletPrivateKeys = exports.generateWallet = exports.getDerivationPaths = exports.mnemonicToAccount = exports.validateMnemonic = exports.generateMnemonic = void 0;
const tslib_1 = require("tslib");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const secp256k1_1 = tslib_1.__importDefault(require("@bitcoinerlab/secp256k1"));
const bip32_1 = require("bip32");
const bip32 = (0, bip32_1.BIP32Factory)(secp256k1_1.default);
const bip39 = tslib_1.__importStar(require("bip39"));
bitcoin.initEccLib(secp256k1_1.default);
const dotenv = tslib_1.__importStar(require("dotenv"));
dotenv.config();
const generateMnemonic = () => {
    return bip39.generateMnemonic();
};
exports.generateMnemonic = generateMnemonic;
const validateMnemonic = (mnemonic) => {
    return bip39.validateMnemonic(mnemonic);
};
exports.validateMnemonic = validateMnemonic;
const mnemonicToAccount = ({ mnemonic = (0, exports.generateMnemonic)(), opts, }) => {
    const options = {
        network: opts?.network ? opts.network : bitcoin.networks.bitcoin,
        index: opts?.index ? opts.index : 0,
        derivationPaths: opts?.derivationPaths,
        spendStrategy: {
            addressOrder: opts?.spendStrategy?.addressOrder
                ? opts.spendStrategy.addressOrder
                : [
                    'nativeSegwit',
                    'nestedSegwit',
                    'legacy',
                    'taproot',
                ],
            utxoSortGreatestToLeast: opts?.spendStrategy?.utxoSortGreatestToLeast !== undefined
                ? opts.spendStrategy.utxoSortGreatestToLeast
                : true,
            changeAddress: opts?.spendStrategy?.changeAddress
                ? opts?.spendStrategy?.changeAddress
                : 'nativeSegwit',
        },
    };
    return (0, exports.generateWallet)({
        mnemonic,
        opts: options,
    });
};
exports.mnemonicToAccount = mnemonicToAccount;
const getDerivationPaths = (index = 0, network = bitcoin.networks.bitcoin, derivationMode = 'bip44_account_last') => {
    const coinType = network === bitcoin.networks.testnet || network === bitcoin.networks.regtest
        ? '1'
        : '0';
    switch (derivationMode) {
        case 'bip44_standard':
            return {
                legacy: `m/44'/${coinType}'/${index}'/0/0`,
                nestedSegwit: `m/49'/${coinType}'/${index}'/0/0`,
                nativeSegwit: `m/84'/${coinType}'/${index}'/0/0`,
                taproot: `m/86'/${coinType}'/${index}'/0/0`,
            };
        case 'bip32_simple':
            return {
                legacy: `m/44'/${coinType}'/${index}'/0`,
                nestedSegwit: `m/49'/${coinType}'/${index}'/0`,
                nativeSegwit: `m/84'/${coinType}'/${index}'/0`,
                taproot: `m/86'/${coinType}'/${index}'/0`,
            };
        case 'bip44_account_last':
        default:
            return {
                legacy: `m/44'/${coinType}'/0'/0/${index}`,
                nestedSegwit: `m/49'/${coinType}'/0'/0/${index}`,
                nativeSegwit: `m/84'/${coinType}'/0'/0/${index}`,
                taproot: `m/86'/${coinType}'/0'/0/${index}`,
            };
    }
};
exports.getDerivationPaths = getDerivationPaths;
const generateWallet = ({ mnemonic, opts, }) => {
    const toXOnly = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
    if (!mnemonic) {
        throw Error('mnemonic not given');
    }
    const derivationPaths = {
        ...(0, exports.getDerivationPaths)(opts.index, opts.network),
        ...opts.derivationPaths,
    };
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    // Legacy
    const childLegacy = root.derivePath(derivationPaths.legacy);
    const pubkeyLegacy = childLegacy.publicKey;
    const addressLegacy = bitcoin.payments.p2pkh({
        pubkey: pubkeyLegacy,
        network: opts.network,
    });
    const legacy = {
        pubkey: pubkeyLegacy.toString('hex'),
        address: addressLegacy.address,
        derivationPath: derivationPaths.legacy,
    };
    // Nested Segwit
    const childSegwitNested = root.derivePath(derivationPaths.nestedSegwit);
    const pubkeySegwitNested = childSegwitNested.publicKey;
    const addressSegwitNested = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
            pubkey: pubkeySegwitNested,
            network: opts.network,
        }),
    });
    const nestedSegwit = {
        pubkey: pubkeySegwitNested.toString('hex'),
        address: addressSegwitNested.address,
        derivationPath: derivationPaths.nestedSegwit,
    };
    // Native Segwit
    const childSegwit = root.derivePath(derivationPaths.nativeSegwit);
    const pubkeySegwit = childSegwit.publicKey;
    const addressSegwit = bitcoin.payments.p2wpkh({
        pubkey: pubkeySegwit,
        network: opts.network,
    });
    const nativeSegwit = {
        pubkey: pubkeySegwit.toString('hex'),
        address: addressSegwit.address,
        derivationPath: derivationPaths.nativeSegwit,
    };
    // Taproot
    const childTaproot = root.derivePath(derivationPaths.taproot);
    const pubkeyTaproot = childTaproot.publicKey;
    const pubkeyTaprootXOnly = toXOnly(pubkeyTaproot);
    const addressTaproot = bitcoin.payments.p2tr({
        internalPubkey: pubkeyTaprootXOnly,
        network: opts.network,
    });
    const taproot = {
        pubkey: pubkeyTaproot.toString('hex'),
        pubKeyXOnly: pubkeyTaprootXOnly.toString('hex'),
        address: addressTaproot.address,
        derivationPath: derivationPaths.taproot,
    };
    return {
        taproot,
        nativeSegwit,
        nestedSegwit,
        legacy,
        spendStrategy: opts.spendStrategy,
        network: opts.network,
    };
};
exports.generateWallet = generateWallet;
const getWalletPrivateKeys = ({ mnemonic, opts, }) => {
    const options = {
        network: opts?.network ? opts.network : bitcoin.networks.bitcoin,
        index: opts?.index ? opts.index : 0,
    };
    const derivationPaths = {
        ...(0, exports.getDerivationPaths)(options.index, options.network),
        ...opts?.derivationPaths,
    };
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    // Legacy
    const childLegacy = root.derivePath(derivationPaths.legacy);
    const privateKeyLegacy = childLegacy.privateKey;
    const legacy = {
        privateKey: privateKeyLegacy.toString('hex'),
    };
    // Nested Segwit
    const childSegwitNested = root.derivePath(derivationPaths.nestedSegwit);
    const privateKey = childSegwitNested.privateKey;
    const nestedSegwit = {
        privateKey: privateKey.toString('hex'),
    };
    // Native Segwit
    const childSegwit = root.derivePath(derivationPaths.nativeSegwit);
    const privateKeySegwit = childSegwit.privateKey;
    const nativeSegwit = {
        privateKey: privateKeySegwit.toString('hex'),
    };
    // Taproot
    const childTaproot = root.derivePath(derivationPaths.taproot);
    const privateKeyTaproot = childTaproot.privateKey;
    const taproot = {
        privateKey: privateKeyTaproot.toString('hex'),
    };
    return {
        taproot,
        nativeSegwit,
        nestedSegwit,
        legacy,
    };
};
exports.getWalletPrivateKeys = getWalletPrivateKeys;
//# sourceMappingURL=account.js.map