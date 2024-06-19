"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const index_1 = require("../utxo/index");
const btc = tslib_1.__importStar(require("../btc/index"));
const index_2 = require("../account/index");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const provider_1 = require("../provider/provider");
const index_3 = require("../signer/index");
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
    .requiredOption('-n, --network <network>', 'the network you want to derive keys on')
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
const accountUtxosToSpend = new commander_1.Command('accountSpendableUtxos')
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
const addressUtxosToSpend = new commander_1.Command('addressSpendableUtxos')
    .description('Returns available utxos to spend')
    .requiredOption('-p, --provider <provider>', 'provider to use when querying the network for utxos')
    .requiredOption('-a, --address <address>', 'address you want to get utxos for')
    .action(async (options) => {
    const provider = defaultProvider[options.provider];
    console.log(await (0, index_1.addressSpendableUtxos)({
        address: options.address,
        provider,
        spendAmount: 100000,
    }));
});
const btcSend = new commander_1.Command('send')
    .requiredOption('-p, --provider <provider>', 'provider to use when querying the network for utxos')
    .requiredOption('-m, --mnemonic <mnemonic>', 'mnemonic you want to get private keys from')
    .requiredOption('-amt, --amount <amount>', 'amount you want to send')
    .requiredOption('-t, --to <to>', 'address you want to send to')
    .option('-legacy, --legacy <legacy>', 'legacy private key')
    .option('-taproot, --taproot <taproot>', 'taproot private key')
    .option('-nested, --nested-segwit <nestedSegwit>', 'nested segwit private key')
    .option('-native, --native-segwit <nativeSegwit>', 'native segwit private key')
    .option('-feeRate, --feeRate <feeRate>', 'fee rate')
    /* @dev example call
    oyl btc send
    -m 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    -native '4604b4b710fe91f584fff084e1a9159fe4f8408fff380596a604948474ce4fa3'
    -p regtest
    -t bcrt1qzr9vhs60g6qlmk7x3dd7g3ja30wyts48sxuemv
    -amt 1000
    -feeRate 2
  */
    .action(async (options) => {
    const provider = defaultProvider[options.provider];
    const signer = new index_3.Signer(provider.network, {
        segwitPrivateKey: options.nativeSegwit,
        taprootPrivateKey: options.taproot,
        nestedSegwitPrivateKey: options.nestedSegwit,
        legacyPrivateKey: options.legacy,
    });
    const account = (0, index_2.mnemonicToAccount)({
        mnemonic: options.mnemonic,
        opts: {
            network: provider.network,
        },
    });
    console.log(await btc.send({
        toAddress: options.to,
        feeRate: options.feeRate,
        account,
        signer,
        provider,
        amount: options.amount,
    }));
});
const accountCommand = new commander_1.Command('account')
    .description('Manage accounts')
    .addCommand(generateCommand)
    .addCommand(privateKeysCommand)
    .addCommand(generateMnemonicCommand);
const utxosCommand = new commander_1.Command('utxos')
    .description('Examine utxos')
    .addCommand(accountUtxosToSpend)
    .addCommand(addressUtxosToSpend);
const btcCommand = new commander_1.Command('btc')
    .description('Functions for sending bitcoin')
    .addCommand(btcSend);
program.addCommand(utxosCommand);
program.addCommand(accountCommand);
program.addCommand(btcCommand);
program.parse(process.argv);
//# sourceMappingURL=index.js.map