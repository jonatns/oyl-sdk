"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const index_1 = require("@account/index");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const program = new commander_1.Command();
program
    .name('oyl-cli')
    .description('All functionality for oyl-sdk in a cli-wrapper')
    .version('0.0.1');
program
    .command('account')
    .description('Creates a new account object')
    .option('-m, --mnemonic <mnemonic>', 'mnemonic you want to generate an account from')
    .option('-i, --index <index>', 'index you want to derive your account keys from')
    .option('-n, --network <network>', 'the network you want to derive keys on')
    .action((options) => {
    const account = (0, index_1.mnemonicToAccount)(options.mnemonic, {
        index: options.index,
        network: bitcoin.networks[options.network],
    });
    console.log(account);
});
program
    .command('utxos')
    .description('Creates a new account object')
    .argument('[mnemonic]', 'mnemonic you want to generate an account from')
    .argument('[index]', 'index you want to derive your account keys from.')
    .action((mnemonic, index, network) => {
    const account = (0, index_1.mnemonicToAccount)(mnemonic, {
        index,
        network: bitcoin.networks[network],
    });
    console.log(account);
});
program.parse();
exports.default = program;
//# sourceMappingURL=index.js.map