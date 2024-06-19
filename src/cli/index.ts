import { Command } from 'commander'
import { accountSpendableUtxos } from '../utxo/index'
import {
  generateMnemonic,
  getWalletPrivateKeys,
  mnemonicToAccount,
} from '../account/index'
import * as bitcoin from 'bitcoinjs-lib'
import { Provider } from '../provider/provider'

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
  .option('-n, --network <network>', 'the network you want to derive keys on')
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

const utxosToSpend = new Command('spendableUtxos')
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
const accountCommand = new Command('account')
  .description('Manage accounts')
  .addCommand(generateCommand)
  .addCommand(privateKeysCommand)
  .addCommand(generateMnemonicCommand)

const utxosCommand = new Command('utxos')
  .description('Examine utxos')
  .addCommand(utxosToSpend)

program.addCommand(utxosCommand)
program.addCommand(accountCommand)

program.parse(process.argv)
