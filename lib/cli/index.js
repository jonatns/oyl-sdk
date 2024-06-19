"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const index_1 = require("../utxo/index");
const index_2 = require("../account/index");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const provider_1 = require("../provider/provider");
const defaultProvider = {
    bitcoin: new provider_1.Provider({
        url: 'https://mainnet.sandshrew.io',
        projectId: process.env.SANDSHREW_PROJECT_ID,
        network: bitcoin.networks.bitcoin,
        networkType: 'mainnet',
    }),
    regtest: new provider_1.Provider({
        url: 'http://localhost:3000',
        projectId: 'regtest',
        network: bitcoin.networks.regtest,
        networkType: 'mainnet',
    }),
};
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
    const account = (0, index_2.mnemonicToAccount)({
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
    const privateKeys = (0, index_2.getWalletPrivateKeys)({
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
    const mnemonic = (0, index_2.generateMnemonic)();
    console.log(mnemonic);
});
const utxosToSpend = new commander_1.Command('spendableUtxos')
    .description('Returns available utxos to spend')
    .requiredOption('-p, --provider <provider>', 'provider to use when querying the network for utxos')
    .requiredOption('-m, --mnemonic <mnemonic>', 'mnemonic you want to get private keys from')
    .action(async (options) => {
    const account = (0, index_2.mnemonicToAccount)({ mnemonic: options.mnemonic });
    const provider = defaultProvider[options.provider];
    console.log(await (0, index_1.accountSpendableUtxos)({
        account,
        provider,
        spendAmount: 100000,
    }));
});
const accountCommand = new commander_1.Command('account')
    .description('Manage accounts')
    .addCommand(generateCommand)
    .addCommand(privateKeysCommand)
    .addCommand(generateMnemonicCommand);
const utxosCommand = new commander_1.Command('utxos')
    .description('Examine utxos')
    .addCommand(utxosToSpend);
program.addCommand(utxosCommand);
program.addCommand(accountCommand);
program.parse(process.argv);
//# sourceMappingURL=index.js.map