import { MnemonicToAccountOptions } from '../account/account'
import { Provider, ProviderConstructorArgs } from '../provider'
import { Network, NetworkOptions } from './interface'
import * as bitcoin from 'bitcoinjs-lib'
import * as dotenv from 'dotenv'
dotenv.config()

export const UTXO_DUST = 546

export const maximumScriptBytes = 520

export const MAXIMUM_FEE = 5000000

export const regtestProviderConstructorArgs: ProviderConstructorArgs = {
  url: 'http://localhost:3000',
  projectId: 'regtest',
  network: bitcoin.networks.regtest,
  networkType: 'mainnet',
  apiUrl: 'https://mainnet-api.oyl.gg',
}

export const defaultProvider = {
  bitcoin: new Provider({
    url: 'https://mainnet.sandshrew.io',
    projectId: process.env.SANDSHREW_PROJECT_ID!,
    network: bitcoin.networks.bitcoin,
    networkType: 'mainnet',
    apiUrl: 'https://staging-api.oyl.gg',
    //opiUrl: 'https://mainnet-opi.sandshrew.io/v1'
  } as ProviderConstructorArgs),
  regtest: new Provider({
    url: 'http://localhost:3000',
    projectId: 'regtest',
    network: bitcoin.networks.regtest,
    networkType: 'mainnet',
    apiUrl: 'https://staging-api.oyl.gg',
    //opiUrl: 'https://mainnet-opi.sandshrew.io/v1'
  } as ProviderConstructorArgs),
}

export const regtestOpts: MnemonicToAccountOptions = {
  network: bitcoin.networks.regtest,
  index: 0,
}

export const Opts: MnemonicToAccountOptions = {
  network: bitcoin.networks.bitcoin,
  index: 0,
  spendStrategy: {
    changeAddress: 'taproot',
    addressOrder: ['nativeSegwit', 'nestedSegwit', 'taproot', 'legacy'],
    utxoSortGreatestToLeast: true,
  },
}

export const regtestMnemonic: string = process.env.REGTEST1
export const mainnetMnemonic: string = process.env.MAINNET_MNEMONIC

export const getBrc20Data = ({
  amount,
  tick,
}: {
  amount: number | string
  tick: string
}) => ({
  mediaContent: `{"p":"brc-20","op":"transfer","tick":"${tick}","amt":"${amount}"}`,
  mediaType: 'text/plain',
})

