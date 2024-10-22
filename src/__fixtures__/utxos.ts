import { FormattedUtxo } from '../utxo/utxo'

export const accountUtxos: FormattedUtxo[] = [
  {
    txId: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b274',
    outputIndex: 2,
    satoshis: 100000,
    confirmations: 3,
    scriptPk:
      'b7fbbedbe61b51bf4e41e3517b8232f31c64f3b67ffd2d8eecff12fc7db4cae5',
    address: 'bcrt1pklamaklxrdgm7njpudghhq3j7vwxfuak0l7jmrhvluf0cld5etjsga00nj', // Taproot (P2TR)
    inscriptions: [],
  },
  {
    txId: '72e22e25fa587c01cbd0a86a5727090c9cdf12e47126c99e35b24185c395b274',
    outputIndex: 2,
    satoshis: 120000,
    confirmations: 3,
    scriptPk:
      'b7fbbedbe61b51bf4e41e3517b8232f31c64f3b67ffd2d8eecff12fc7db4cae5',
    address: 'bcrt1pklamaklxrdgm7njpudghhq3j7vwxfuak0l7jmrhvluf0cld5etjsga00nj', // Taproot (P2TR)
    inscriptions: [],
  },
  {
    txId: '7c34e62d6f9d01e7693f9a722df6c0e74e1b7b0c3e8f6de01b9f6a6b2fd848ac',
    outputIndex: 0,
    satoshis: 50000,
    confirmations: 2,
    scriptPk:
      'b9f2bedbe51c23bf4a45e4515a6342f32c94f4b78fdd2d9eecce12fc9db8cae3',
    address: 'bcrt1qrz9sy68vnqfddkqkq4xh56dd9tj0ldypkqyxhs', // Native SegWit (P2WPKH)
    inscriptions: [],
  },
  {
    txId: '7c34e62d6f9d01e7693f9a722df6c0e74e1b7b0c3e8f6de01b9f6a6b2fd848ac',
    outputIndex: 0,
    satoshis: 30000,
    confirmations: 2,
    scriptPk:
      'b9f2bedbe51c23bf4a45e4515a6342f32c94f4b78fdd2d9eecce12fc9db8cae3',
    address: 'bcrt1qrz9sy68vnqfddkqkq4xh56dd9tj0ldypkqyxhs', // Native SegWit (P2WPKH)
    inscriptions: [],
  },
  {
    txId: '3f5e5b6d2c987645c3e1e3a7cbf048d6a59d7c921d55c8e1d5a96b3f2f60eb6a',
    outputIndex: 1,
    satoshis: 30000,
    confirmations: 4,
    scriptPk:
      'a8e6cc2ce32f02ebd1d33c1d65c74c3e2ed43f3a5c3f8d1fdb5b6b9e5c5e7b7d',
    address: '2N3dtsJjqbXWLEK2Np6JePpKHyy5ph6wYPy', // Nested SegWit (P2SH-P2WPKH)
    inscriptions: [],
  },
  {
    txId: '3f5e5b6d2c987645c3e1e3a7cbf048d6a59d7c921d55c8e1d5a96b3f2f60eb6a',
    outputIndex: 1,
    satoshis: 35000,
    confirmations: 4,
    scriptPk:
      'a8e6cc2ce32f02ebd1d33c1d65c74c3e2ed43f3a5c3f8d1fdb5b6b9e5c5e7b7d',
    address: '2N3dtsJjqbXWLEK2Np6JePpKHyy5ph6wYPy', // Nested SegWit (P2SH-P2WPKH)
    inscriptions: [],
  },
  {
    txId: '4a8e2b5a2e76df3a5c3e2c4a75b3f0e7b59a7d1c9b1f6f2d1d0e4f1b9c3e7b9a',
    outputIndex: 0,
    satoshis: 75000,
    confirmations: 5,
    scriptPk:
      'b8c6dd1a8e7c01ebd3d65c2f2c5d5e7b8c9d7e5b6f2f9a1b3e9e7c3f8b5a9c6e',
    address: 'mxbBHPuZmf8Ve5pBgdbwDjLP1cR3mqZZQM', // Legacy (P2PKH)
    inscriptions: [],
  },
  {
    txId: '4a8e2b5a2e76df3a5c3e2c4a75b3f0e7b59a7d1c9b1f6f2d1d0e4f1b9c3e7b9a',
    outputIndex: 0,
    satoshis: 100000,
    confirmations: 5,
    scriptPk:
      'b8c6dd1a8e7c01ebd3d65c2f2c5d5e7b8c9d7e5b6f2f9a1b3e9e7c3f8b5a9c6e',
    address: 'mxbBHPuZmf8Ve5pBgdbwDjLP1cR3mqZZQM', // Legacy (P2PKH)
    inscriptions: [],
  },
]
