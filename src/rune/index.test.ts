import * as bitcoin from 'bitcoinjs-lib'
import { createMintPsbt, createSendPsbt } from '../rune'
import { Account, mnemonicToAccount } from '../account/account'
import { Provider } from '../provider/provider'
import { FormattedUtxo } from '../utxo/utxo'
import { RuneUTXO } from '..'

const provider = new Provider({
  url: '',
  projectId: '',
  network: bitcoin.networks.regtest,
  networkType: 'mainnet',
})

const account: Account = mnemonicToAccount({
  mnemonic:
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  opts: { index: 0, network: bitcoin.networks.regtest },
})

const { address } = bitcoin.payments.p2wpkh({
  pubkey: Buffer.from(account.nativeSegwit.pubkey, 'hex'),
  network: bitcoin.networks.regtest,
})
const { output } = bitcoin.payments.p2wpkh({
  address,
  network: bitcoin.networks.regtest,
})
const scriptPk = output!.toString('hex')

const testFormattedUtxos: FormattedUtxo[] = [
  {
    txId: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b274',
    outputIndex: 0,
    satoshis: 100000,
    confirmations: 3,
    scriptPk,
    address: account.taproot.address,
    inscriptions: [],
  },
  {
    txId: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b275',
    outputIndex: 0,
    satoshis: 100000,
    confirmations: 3,
    scriptPk,
    address: account.nativeSegwit.address,
    inscriptions: [],
  },
]

const runeUtxos: RuneUTXO[] = [
  {
    txId: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b276',
    txIndex: '0',
    satoshis: 10000,
    amountOfRunes: 500,
    script: scriptPk,
    address: account.taproot.address,
  },
  {
    txId: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b277',
    txIndex: '0',
    satoshis: 3333,
    amountOfRunes: 1000,
    script: scriptPk,
    address: account.nativeSegwit.address,
  },
]

jest.spyOn(require('../rune/rune'), 'findRuneUtxos').mockResolvedValue({
  runeUtxos,
  runeTotalSatoshis: 103333,
  divisibility: 3,
})

describe('rune txs', () => {
  it('rune send tx', async () => {
    const { psbt } = await createSendPsbt({
      gatheredUtxos: {
        utxos: testFormattedUtxos,
        totalAmount: 200000,
      },
      toAddress: address!,
      amount: 3000,
      feeRate: 10,
      account,
      provider: provider,
      runeId: '30003:1',
      inscriptionAddress: account.taproot.address,
    })

    expect(psbt).toEqual(
      'cHNidP8BAP0GAQIAAAADdrKVw4VBsjWeySZx5BLfnAwJJ1dqqNDLAXxY+iUu4nIAAAAAAP////93spXDhUGyNZ7JJnHkEt+cDAknV2qo0MsBfFj6JS7icgAAAAAA/////3SylcOFQbI1nskmceQS35wMCSdXaqjQywF8WPolLuJyAAAAAAD/////BAAAAAAAAAAAD2pdDBYBALPqAQHAjbcBAiICAAAAAAAAIlEgO4KysqkYUxXab4DaXwbQRA2KXhRX+pM4fC2RnIbsh4alkwEAAAAAABYAFNDEo+8J6Ze26Z45flGP4+QaEYyhanoBAAAAAAAWABTQxKPvCemXtumeOX5Rj+PkGhGMoQAAAAAAAQEfECcAAAAAAAAWABTQxKPvCemXtumeOX5Rj+PkGhGMoQABAR8FDQAAAAAAABYAFNDEo+8J6Ze26Z45flGP4+QaEYyhAAEBH6CGAQAAAAAAFgAU0MSj7wnpl7bpnjl+UY/j5BoRjKEAAAAAAA=='
    )
  })

  it('rune mint tx', async () => {
    expect(true).toBeTruthy()
  })

  it('rune send tx', async () => {
    expect(true).toBeTruthy()
  })
})
