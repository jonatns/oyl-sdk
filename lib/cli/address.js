"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDRESS_COMMANDS = exports.getPrivate = exports.getAddress = exports.REGTEST_PARAMS = void 0;
const tslib_1 = require("tslib");
const bip32_1 = tslib_1.__importDefault(require("bip32"));
const bip39 = tslib_1.__importStar(require("bip39"));
const commander_1 = require("commander");
const lodash_1 = require("lodash");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
exports.REGTEST_PARAMS = {
    bech32: "bcrt",
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
};
function getAddress(node, network) {
    return bitcoin.payments.p2wpkh({
        pubkey: node.publicKey,
        network: bitcoin.networks[network]
    }).address;
}
exports.getAddress = getAddress;
;
async function getPrivate(mnemonic) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const bip32 = (0, bip32_1.default)(await Promise.resolve().then(() => tslib_1.__importStar(require("tiny-secp256k1"))));
    const root = bip32.fromSeed(seed, bitcoin.networks.regtest);
    return root.derivePath("m/84'/0'/0'/0/0");
}
exports.getPrivate = getPrivate;
;
exports.ADDRESS_COMMANDS = (0, lodash_1.mapValues)({
    getprivate: (command) => command.description("get private key in hex associated with mnemonic")
        .option("-m, --mnemonic <mnemonic>", "mnemonic for wallet")
        .action((options) => {
        (async () => {
            console.log(Buffer.from((await getPrivate(options.mnemonic || process.env.MNEMONIC || (() => { throw Error("must supply mnemonic via -m flag or the MNEMONIC environment variable"); })())).privateKey).toString('hex'));
        })().catch((err) => console.error(err));
    }),
    getaddress: (command) => command.description("get private key in hex associated with mnemonic")
        .option("-m, --mnemonic <mnemonic>", "mnemonic for wallet")
        .option("-n, --network <network>", "network to target")
        .action((options) => {
        (async () => {
            console.log(getAddress((await getPrivate(options.mnemonic || process.env.MNEMONIC || (() => { throw Error("must supply mnemonic via -m flag or the MNEMONIC environment variable"); })())), options.network || 'regtest'));
        })().catch((err) => console.error(err));
    })
}, (v, k) => v(new commander_1.Command(k)));
//# sourceMappingURL=address.js.map