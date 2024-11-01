import * as bitcoin from 'bitcoinjs-lib'
import ecc from '@bitcoinerlab/secp256k1'
import { BIP32Factory } from 'bip32'
const bip32 = BIP32Factory(ecc)
import * as bip39 from 'bip39'
bitcoin.initEccLib(ecc)
import * as dotenv from 'dotenv'
dotenv.config()

export type Account = {
  taproot: {
    pubkey: string
    pubKeyXOnly: string
    address: string
    derivationPath: string
  }
  nativeSegwit: {
    pubkey: string
    address: string
    derivationPath: string
  }
  nestedSegwit: {
    pubkey: string
    address: string
    derivationPath: string
  }
  legacy: {
    pubkey: string
    address: string
    derivationPath: string
  }
  spendStrategy: SpendStrategy
  network: bitcoin.Network
}

export type AddressKey = 'nativeSegwit' | 'taproot' | 'nestedSegwit' | 'legacy'

export type DerivationMode =
  | 'bip44_account_last'
  | 'bip44_standard'
  | 'bip32_simple'

export type DerivationPaths = {
  legacy?: string
  nestedSegwit?: string
  nativeSegwit?: string
  taproot?: string
}

export interface SpendStrategy {
  addressOrder: AddressKey[]
  utxoSortGreatestToLeast: boolean
  changeAddress: AddressKey
}

export interface MnemonicToAccountOptions {
  network?: bitcoin.networks.Network
  index?: number
  spendStrategy?: SpendStrategy
  derivationPaths?: DerivationPaths
}

export const generateMnemonic = () => {
  return bip39.generateMnemonic()
}

export const validateMnemonic = (mnemonic: string) => {
  return bip39.validateMnemonic(mnemonic)
}

export const mnemonicToAccount = ({
  mnemonic = generateMnemonic(),
  opts,
}: {
  mnemonic?: string
  opts?: MnemonicToAccountOptions
}): Account => {
  const options = {
    network: opts?.network ? opts.network : bitcoin.networks.bitcoin,
    index: opts?.index ? opts.index : 0,
    derivationPaths: opts?.derivationPaths,
    spendStrategy: {
      addressOrder: opts?.spendStrategy?.addressOrder
        ? opts.spendStrategy.addressOrder
        : ([
            'nativeSegwit',
            'nestedSegwit',
            'legacy',
            'taproot',
          ] as AddressKey[]),
      utxoSortGreatestToLeast:
        opts?.spendStrategy?.utxoSortGreatestToLeast !== undefined
          ? opts.spendStrategy.utxoSortGreatestToLeast
          : true,
      changeAddress: opts?.spendStrategy?.changeAddress
        ? opts?.spendStrategy?.changeAddress
        : 'nativeSegwit',
    },
  }

  return generateWallet({
    mnemonic,
    opts: options,
  })
}

export const getDerivationPaths = (
  index: number,
  network = bitcoin.networks.bitcoin,
  derivationMode: DerivationMode = 'bip44_account_last'
): DerivationPaths => {
  const coinType =
    network === bitcoin.networks.testnet || network === bitcoin.networks.regtest
      ? '1'
      : '0'

  switch (derivationMode) {
    case 'bip44_standard':
      return {
        legacy: `m/44'/${coinType}'/${index}'/0/0`,
        nestedSegwit: `m/49'/${coinType}'/${index}'/0/0`,
        nativeSegwit: `m/84'/${coinType}'/${index}'/0/0`,
        taproot: `m/86'/${coinType}'/${index}'/0/0`,
      }

    case 'bip32_simple':
      return {
        legacy: `m/44'/${coinType}'/${index}'/0`,
        nestedSegwit: `m/49'/${coinType}'/${index}'/0`,
        nativeSegwit: `m/84'/${coinType}'/${index}'/0`,
        taproot: `m/86'/${coinType}'/${index}'/0`,
      }

    case 'bip44_account_last':
    default:
      return {
        legacy: `m/44'/${coinType}'/0'/0/${index}`,
        nestedSegwit: `m/49'/${coinType}'/0'/0/${index}`,
        nativeSegwit: `m/84'/${coinType}'/0'/0/${index}`,
        taproot: `m/86'/${coinType}'/0'/0/${index}`,
      }
  }
}

export const generateWallet = ({
  mnemonic,
  opts,
}: {
  mnemonic?: string
  opts: MnemonicToAccountOptions
}) => {
  const toXOnly = (pubKey: Buffer) =>
    pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)

  if (!mnemonic) {
    throw Error('mnemonic not given')
  }

  const derivationPaths = {
    ...getDerivationPaths(opts.index, opts.network),
    ...opts.derivationPaths,
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed)

  // Legacy
  const childLegacy = root.derivePath(derivationPaths.legacy)
  const pubkeyLegacy = childLegacy.publicKey
  const addressLegacy = bitcoin.payments.p2pkh({
    pubkey: pubkeyLegacy,
    network: opts.network,
  })
  const legacy = {
    pubkey: pubkeyLegacy.toString('hex'),
    address: addressLegacy.address,
    derivationPath: derivationPaths.legacy,
  }

  // Nested Segwit
  const childSegwitNested = root.derivePath(derivationPaths.nestedSegwit)
  const pubkeySegwitNested = childSegwitNested.publicKey
  const addressSegwitNested = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({
      pubkey: pubkeySegwitNested,
      network: opts.network,
    }),
  })
  const nestedSegwit = {
    pubkey: pubkeySegwitNested.toString('hex'),
    address: addressSegwitNested.address,
    derivationPath: derivationPaths.nestedSegwit,
  }

  // Native Segwit
  const childSegwit = root.derivePath(derivationPaths.nativeSegwit)
  const pubkeySegwit = childSegwit.publicKey
  const addressSegwit = bitcoin.payments.p2wpkh({
    pubkey: pubkeySegwit,
    network: opts.network,
  })
  const nativeSegwit = {
    pubkey: pubkeySegwit.toString('hex'),
    address: addressSegwit.address,
    derivationPath: derivationPaths.nativeSegwit,
  }

  // Taproot
  const childTaproot = root.derivePath(derivationPaths.taproot)
  const pubkeyTaproot = childTaproot.publicKey
  const pubkeyTaprootXOnly = toXOnly(pubkeyTaproot)

  const addressTaproot = bitcoin.payments.p2tr({
    internalPubkey: pubkeyTaprootXOnly,
    network: opts.network,
  })
  const taproot = {
    pubkey: pubkeyTaproot.toString('hex'),
    pubKeyXOnly: pubkeyTaprootXOnly.toString('hex'),
    address: addressTaproot.address,
    derivationPath: derivationPaths.taproot,
  }

  return {
    taproot,
    nativeSegwit,
    nestedSegwit,
    legacy,
    spendStrategy: opts.spendStrategy,
    network: opts.network,
  }
}

export const getWalletPrivateKeys = ({
  mnemonic,
  opts,
}: {
  mnemonic: string
  opts?: MnemonicToAccountOptions
}) => {
  const options = {
    network: opts?.network ? opts.network : bitcoin.networks.bitcoin,
    index: opts?.index ? opts.index : 0,
  }

  const derivationPaths = {
    ...getDerivationPaths(options.index, options.network),
    ...opts?.derivationPaths,
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed)

  // Legacy
  const childLegacy = root.derivePath(derivationPaths.legacy)
  const privateKeyLegacy = childLegacy.privateKey!
  const legacy = {
    privateKey: privateKeyLegacy.toString('hex'),
  }

  // Nested Segwit
  const childSegwitNested = root.derivePath(derivationPaths.nestedSegwit)
  const privateKey = childSegwitNested.privateKey!
  const nestedSegwit = {
    privateKey: privateKey.toString('hex'),
  }

  // Native Segwit
  const childSegwit = root.derivePath(derivationPaths.nativeSegwit)
  const privateKeySegwit = childSegwit.privateKey!

  const nativeSegwit = {
    privateKey: privateKeySegwit.toString('hex'),
  }

  // Taproot
  const childTaproot = root.derivePath(derivationPaths.taproot)
  const privateKeyTaproot = childTaproot.privateKey!

  const taproot = {
    privateKey: privateKeyTaproot.toString('hex'),
  }

  return {
    taproot,
    nativeSegwit,
    nestedSegwit,
    legacy,
  }
}
