import { Command } from 'commander'
import {
  generateMnemonic,
  getWalletPrivateKeys,
  mnemonicToAccount,
} from '../account/index'
import * as bitcoin from 'bitcoinjs-lib'

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

const testing = new Command('testing')
  .description('Returns a new mnemonic phrase')
  .action(() => {
    console.log('Working')
  })
const accountCommand = new Command('account')
  .description('Manage accounts')
  .addCommand(generateCommand)
  .addCommand(privateKeysCommand)
  .addCommand(generateMnemonicCommand)

const utxosCommand = new Command('utxos')
  .description('Examine utxos')
  .addCommand(testing)

program.addCommand(utxosCommand)
program.addCommand(accountCommand)

program.parse(process.argv)
