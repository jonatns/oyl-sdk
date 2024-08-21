import * as bitcoin from 'bitcoinjs-lib'
import { createPsbt, send } from './btc'
import { accountUtxos } from '../utxo/utxo'
import { Account, mnemonicToAccount } from '../account/account'
import { Opts, mainnetMnemonic } from '../shared/constants'
import { Provider } from '../provider/provider'
import * as dotenv from 'dotenv'

dotenv.config()

const provider = new Provider({
  url: 'https://mainnet.sandshrew.io',
  projectId: process.env.SANDSHREW_PROJECT_ID!,
  network: bitcoin.networks.bitcoin,
  networkType: 'mainnet',
})

const account: Account = mnemonicToAccount({
  mnemonic: mainnetMnemonic,
  opts: Opts,
})
const { address } = bitcoin.payments.p2wpkh({
  pubkey: Buffer.from(account.nativeSegwit.pubkey, 'hex'),
})
const { output } = bitcoin.payments.p2wpkh({ address })
const scriptPk = output.toString('hex')

jest.mock('../provider/provider', () => ({
  Provider: jest.fn().mockImplementation(() => ({
    esplora: {
      getFeeEstimates: jest.fn().mockResolvedValue({ '1': 100 }),
    },
  })),
}))

jest.spyOn(require('../utxo'), 'accountUtxos').mockResolvedValue({
  totalAmount: 20000,
  utxos: [
    {
      txId: 'e3c3b1c9e5a45b4f6c7e1a9c3d6e2a7d8f9b0c3a5c7e4f6d7e1a8b9c0a1b2c3d',
      outputIndex: 0,
      satoshis: 20000,
      scriptPk: scriptPk,
    },
  ],
})

describe('btc sendTx', () => {
  it('creates a transaction successfully', async () => {
    const result = await createPsbt({
      toAddress: address,
      amount: 3000,
      feeRate: 10,
      account: account,
      provider: provider,
    })

    expect(result.psbt).toBeDefined()

    expect(accountUtxos).toHaveBeenCalledWith({
      account: account,
      provider: provider,
      spendAmount: 4540,
    })
  })
})
