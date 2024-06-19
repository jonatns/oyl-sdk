import { Command } from 'commander'
import { accountSpendableUtxos, addressSpendableUtxos } from '../utxo/index'
import * as btc from '../btc/index'

import {
  generateMnemonic,
  getWalletPrivateKeys,
  mnemonicToAccount,
} from '../account/index'
import * as bitcoin from 'bitcoinjs-lib'
import { Provider } from '../provider/provider'
import { Signer } from '../signer/index'

const defaultProvider = {
  bitcoin: new Provider({
    url: 'https://mainnet.sandshrew.io',
    projectId: process.env.SANDSHREW_PROJECT_ID!,
    network: bitcoin.networks.bitcoin,
    networkType: 'mainnet',
  }),
  regtest: new Provider({
    url: 'http://localhost:3000',
    projectId: 'regtest',
    network: bitcoin.networks.regtest,
    networkType: 'mainnet',
  }),
}

const program = new Command()

program
  .name('default')
  .description('All functionality for oyl-sdk in a cli-wrapper')
  .version('0.0.1')

const generateCommand = new Command('generate')
  .description('Creates a new account object')
  .option(
    '-m, --mnemonic <mnemonic>',
    'mnemonic you want to generate an account from'
  )
  .option(
    '-i, --index <index>',
    'index you want to derive your account keys from'
  )
  .option('-n, --network <network>', 'the network you want to derive keys on')
  .action((options) => {
    const account = mnemonicToAccount({
      mnemonic: options.mnemonic,
      opts: {
        index: options.index,
        network: bitcoin.networks[options.network],
      },
    })
    console.log(account)
  })

const privateKeysCommand = new Command('privateKeys')
  .description('Returns private keys for an account object')
  .requiredOption(
    '-m, --mnemonic <mnemonic>',
    'mnemonic you want to get private keys from'
  )
  .option(
    '-i, --index <index>',
    'index you want to derive your account keys from'
  )
  .requiredOption(
    '-n, --network <network>',
    'the network you want to derive keys on'
  )
  .action((options) => {
    const privateKeys = getWalletPrivateKeys({
      mnemonic: options.mnemonic,
      opts: {
        index: options.index,
        network: bitcoin.networks[options.network],
      },
    })
    console.log(privateKeys)
  })

const generateMnemonicCommand = new Command('generateMnemonic')
  .description('Returns a new mnemonic phrase')
  .action(() => {
    const mnemonic = generateMnemonic()
    console.log(mnemonic)
  })

const accountUtxosToSpend = new Command('accountSpendableUtxos')
  .description('Returns available utxos to spend')
  .requiredOption(
    '-p, --provider <provider>',
    'provider to use when querying the network for utxos'
  )
  .requiredOption(
    '-m, --mnemonic <mnemonic>',
    'mnemonic you want to get private keys from'
  )
  .action(async (options) => {
    const account = mnemonicToAccount({ mnemonic: options.mnemonic })
    const provider = defaultProvider[options.provider]
    console.log(
      await accountSpendableUtxos({
        account,
        provider,
        spendAmount: 100000,
      })
    )
  })

const addressUtxosToSpend = new Command('addressSpendableUtxos')
  .description('Returns available utxos to spend')
  .requiredOption(
    '-p, --provider <provider>',
    'provider to use when querying the network for utxos'
  )
  .requiredOption(
    '-a, --address <address>',
    'address you want to get utxos for'
  )
  .action(async (options) => {
    const provider = defaultProvider[options.provider]
    console.log(
      await addressSpendableUtxos({
        address: options.address,
        provider,
        spendAmount: 100000,
      })
    )
  })

const btcSend = new Command('send')
  .requiredOption(
    '-p, --provider <provider>',
    'provider to use when querying the network for utxos'
  )
  .requiredOption(
    '-m, --mnemonic <mnemonic>',
    'mnemonic you want to get private keys from'
  )
  .requiredOption('-amt, --amount <amount>', 'amount you want to send')
  .requiredOption('-t, --to <to>', 'address you want to send to')
  .option('-legacy, --legacy <legacy>', 'legacy private key')
  .option('-taproot, --taproot <taproot>', 'taproot private key')
  .option(
    '-nested, --nested-segwit <nestedSegwit>',
    'nested segwit private key'
  )
  .option(
    '-native, --native-segwit <nativeSegwit>',
    'native segwit private key'
  )
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
    const provider = defaultProvider[options.provider]
    const signer = new Signer(provider.network, {
      segwitPrivateKey: options.nativeSegwit,
      taprootPrivateKey: options.taproot,
      nestedSegwitPrivateKey: options.nestedSegwit,
      legacyPrivateKey: options.legacy,
    })
    const account = mnemonicToAccount({
      mnemonic: options.mnemonic,
      opts: {
        network: provider.network,
      },
    })
    console.log(
      await btc.send({
        toAddress: options.to,
        feeRate: options.feeRate,
        account,
        signer,
        provider,
        amount: options.amount,
      })
    )
  })

const accountCommand = new Command('account')
  .description('Manage accounts')
  .addCommand(generateCommand)
  .addCommand(privateKeysCommand)
  .addCommand(generateMnemonicCommand)

const utxosCommand = new Command('utxos')
  .description('Examine utxos')
  .addCommand(accountUtxosToSpend)
  .addCommand(addressUtxosToSpend)

const btcCommand = new Command('btc')
  .description('Functions for sending bitcoin')
  .addCommand(btcSend)

program.addCommand(utxosCommand)
program.addCommand(accountCommand)
program.addCommand(btcCommand)

program.parse(process.argv)
