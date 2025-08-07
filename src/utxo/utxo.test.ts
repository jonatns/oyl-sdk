import { Provider } from '../provider/provider'
import * as dotenv from 'dotenv'
import * as bitcoin from 'bitcoinjs-lib'
import { addressUtxos, selectUtxos, accountUtxos, selectSpendableUtxos } from './utxo'
import { Account, mnemonicToAccount, SpendStrategy } from '../account'
import { FormattedUtxo, SandShrewBalancesAddressInfo } from './types'
import { getAddressKey } from '../shared/utils'

dotenv.config()

const provider = new Provider({
  url: 'https://mainnet.sandshrew.io',
  projectId: process.env.SANDSHREW_PROJECT_ID!,
  network: bitcoin.networks.bitcoin,
  networkType: 'mainnet',
})

const testFormattedUtxos: FormattedUtxo[] = [
  {
    txId: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b274',
    outputIndex: 2,
    satoshis: 100000,
    confirmations: 3,
    scriptPk:
      'b7fbbedbe61b51bf4e41e3517b8232f31c64f3b67ffd2d8eecff12fc7db4cae5',
    address: 'bc1pklamaklxrdgm7njpudghhq3j7vwxfuak0l7jmrhvluf0cld5etjsga00nj',
    inscriptions: [],
    runes: {},
    alkanes: {},
    indexed: true,
  },
  {
    txId: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b275',
    outputIndex: 0,
    satoshis: 50000,
    confirmations: 3,
    scriptPk:
      'b7fbbedbe61b51bf4e41e3517b8232f31c64f3b67ffd2d8eecff12fc7db4cae5',
    address: 'bc1pklamaklxrdgm7njpudghhq3j7vwxfuak0l7jmrhvluf0cld5etjsga00nj',
    inscriptions: [],
    runes: {},
    alkanes: {},
    indexed: true,
  },
]

const testSandshrewBalances: SandShrewBalancesAddressInfo = {
  spendable: [
    {
      outpoint: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b274:2',
      value: 100000,
      height: 280,
    },
    {
      outpoint: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b275:0',
      value: 50000,
      height: 280,
    },
  ],
  assets: [
    {
      outpoint: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b276:1',
      value: 546,
      height: 280,
      inscriptions: ['e605df4731c8773902dd6f56bfbec815db26d530da00dbdc697e35a992269987i0'],
    },
    {
      outpoint: 'a24dd4edc2fdfa769ba45cb480d392b806ad12533b097c84285d808d65b9f923:1',
      value: 546,
      height: 280,
      ord_runes: {
        "RUNE": {
          amount: 0,
          divisibility: 1
        },
      },
    },
    {
      outpoint: '3a7f22842a6ffc0135d76ffd2ad3add1ee72753ead36d21f22e7ef89afb1fc43:0',
      value: 546,
      height: 280,
      ord_runes: {
        "RUNE": {
          amount: 0,
          divisibility: 1
        },
      },
      runes: [
        {
          rune: {
            id: {
            block: "0x2",
            tx: "0x1"
          },
          name: 'TEST.ALKANE',
          symbol: 'ALK',
        },
        balance: "0x14"
      }
      ]
    }
  ],
  pending: [
    {
      outpoint: 'ad90d820fc7f25e32c775ccf9f90d3669864fef436abcd44776f03d4a11540c4:0',
      value: 50000,
    }
  ],
  ordHeight: 283,
  metashrewHeight: 283,
}

const mockSandshrewBalances = jest.fn().mockResolvedValue(testSandshrewBalances)
const mockMultiCall = jest.fn().mockResolvedValue([{ result: 283 }])

jest.mock('../provider/provider', () => {
  return {
    Provider: jest.fn().mockImplementation(() => ({
      network: bitcoin.networks.bitcoin,
      sandshrew: {
        sandShrewBalances: (args) => mockSandshrewBalances(args),
        multiCall: (args) => mockMultiCall(args),
      },
    })),
  }
})

const testAccount: Account = mnemonicToAccount({
  mnemonic:
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  opts: { index: 0, network: bitcoin.networks.bitcoin },
})

describe('utxo', () => {
  it('addressUtxos', async () => {
    const result = await addressUtxos({
      address: 'bc1pklamaklxrdgm7njpudghhq3j7vwxfuak0l7jmrhvluf0cld5etjsga00nj',
      provider,
    })
    expect(result.spendableTotalBalance).toBe(150000)
    expect(result.pendingTotalBalance).toBe(0)
     expect(result.totalBalance).toBe(150000)
    expect(result.spendableUtxos.length).toBe(2)
    expect(result.ordUtxos.length).toBe(1)
    expect(result.runeUtxos.length).toBe(2)
    expect(result.alkaneUtxos.length).toBe(1)
    expect(result.pendingUtxos.length).toBe(0)
    expect(result.utxos.length).toBe(6)
  })

  describe('selectSpendableUtxos', () => {
    const spendStrategy: SpendStrategy = {
      addressOrder: [getAddressKey(testFormattedUtxos[0].address)],
      utxoSortGreatestToLeast: true,
      changeAddress: 'taproot'
    }

    it('returns the right utxos for smart spend (default)', async () => {
      const result = selectSpendableUtxos(testFormattedUtxos, spendStrategy)
      expect(result.utxos.length).toBe(2)
      expect(result.totalAmount).toBe(150000)
    })

    it('returns the right utxos when sorting from least to greatest', async () => {
      const result = selectSpendableUtxos(testFormattedUtxos, spendStrategy)
      expect(result.utxos.length).toBe(2)
      expect(result.totalAmount).toBe(150000)
    })
  })

  describe('selectUtxos', () => {
    it('sorts utxos from greatest to least by default', () => {
      const spendStrategy: SpendStrategy = {
        addressOrder: [getAddressKey(testFormattedUtxos[0].address)],
        utxoSortGreatestToLeast: true,
        changeAddress: 'taproot'
      }
      const result = selectUtxos(testFormattedUtxos, spendStrategy)
      expect(result[0].satoshis).toBe(100000)
      expect(result[1].satoshis).toBe(50000)
    })

    it('sorts utxos from least to greatest when specified', () => {
      const spendStrategy: SpendStrategy = {
        addressOrder: [getAddressKey(testFormattedUtxos[0].address)],
        utxoSortGreatestToLeast: false,
        changeAddress: 'taproot'
      }
      const result = selectUtxos(testFormattedUtxos, spendStrategy)
      expect(result[0].satoshis).toBe(50000)
      expect(result[1].satoshis).toBe(100000)
    })
  })

  describe('accountUtxos', () => {
    it('should handle multiple address types and calculate correct balances', async () => {
      const result = await accountUtxos({
        account: testAccount as any,
        provider,
      })

      expect(result.accountTotalBalance).toBe(600000)
      expect(result.accountSpendableTotalBalance).toBe(600000)
      expect(result.accountSpendableTotalUtxos.length).toBe(8)
      expect(result.accountPendingTotalBalance).toBe(0)
      expect(Object.keys(result.accounts).length).toBe(4)
    })
  })
})
