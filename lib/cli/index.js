"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const index_1 = require("../account/index");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const program = new commander_1.Command();
program
    .name('default')
    .description('All functionality for oyl-sdk in a cli-wrapper')
    .version('0.0.1');
const generateCommand = new commander_1.Command('generate')
    .description('Creates a new account object')
    .option('-m, --mnemonic <mnemonic>', 'mnemonic you want to generate an account from')
    .option('-i, --index <index>', 'index you want to derive your account keys from')
    .option('-n, --network <network>', 'the network you want to derive keys on')
    .action((options) => {
    const account = (0, index_1.mnemonicToAccount)({
        mnemonic: options.mnemonic,
        opts: {
            index: options.index,
            network: bitcoin.networks[options.network],
        },
    });
    console.log(account);
});
const privateKeysCommand = new commander_1.Command('privateKeys')
    .description('Returns private keys for an account object')
    .requiredOption('-m, --mnemonic <mnemonic>', 'mnemonic you want to get private keys from')
    .option('-i, --index <index>', 'index you want to derive your account keys from')
    .option('-n, --network <network>', 'the network you want to derive keys on')
    .action((options) => {
    const privateKeys = (0, index_1.getWalletPrivateKeys)({
        mnemonic: options.mnemonic,
        opts: {
            index: options.index,
            network: bitcoin.networks[options.network],
        },
    });
    console.log(privateKeys);
});
const generateMnemonicCommand = new commander_1.Command('generateMnemonic')
    .description('Returns a new mnemonic phrase')
    .action(() => {
    const mnemonic = (0, index_1.generateMnemonic)();
    console.log(mnemonic);
});
const testing = new commander_1.Command('testing')
    .description('Returns a new mnemonic phrase')
    .action(() => {
    console.log('Working');
});
const accountCommand = new commander_1.Command('account')
    .description('Manage accounts')
    .addCommand(generateCommand)
    .addCommand(privateKeysCommand)
    .addCommand(generateMnemonicCommand);
const utxosCommand = new commander_1.Command('utxos')
    .description('Examine utxos')
    .addCommand(testing);
program.addCommand(utxosCommand);
program.addCommand(accountCommand);
program.parse(process.argv);
//# sourceMappingURL=index.js.map