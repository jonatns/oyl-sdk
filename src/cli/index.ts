import { Command } from 'commander'
import { mnemonicToAccount } from '@account/index'
import * as bitcoin from 'bitcoinjs-lib'

const program = new Command()

program
  .name('oyl-cli')
  .description('All functionality for oyl-sdk in a cli-wrapper')
  .version('0.0.1')

program
  .command('account')
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
    const account = mnemonicToAccount(options.mnemonic, {
      index: options.index,
      network: bitcoin.networks[options.network],
    })
    console.log(account)
  })

program
  .command('utxos')
  .description('Creates a new account object')
  .argument('[mnemonic]', 'mnemonic you want to generate an account from')
  .argument('[index]', 'index you want to derive your account keys from.')
  .action(
    (
      mnemonic: string,
      index: number,
      network: 'bitcoin' | 'testnet' | 'regtest'
    ) => {
      const account = mnemonicToAccount(mnemonic, {
        index,
        network: bitcoin.networks[network],
      })
      console.log(account)
    }
  )

program.parse()

export default program
