import * as bitcoin from 'bitcoinjs-lib'
import ecc from '@bitcoinerlab/secp256k1'
import { BIP32Factory } from 'bip32'
const bip32 = BIP32Factory(ecc)
import * as bip39 from 'bip39'
bitcoin.initEccLib(ecc)
import * as dotenv from 'dotenv'
dotenv.config()

export interface MnemonicToAccountOptions {
  network?: bitcoin.networks.Network
  index?: number
  spendStrategy?: SpendStrategy
}
export const mnemonicToAccount = (
  mnemonic: string,
  opts?: MnemonicToAccountOptions
) => {
  const options = {
    network: opts?.network ? opts.network : bitcoin.networks.bitcoin,
    index: opts?.index ? opts.index : 0,
    spendStrategy: {
      addressOrder: opts?.spendStrategy?.addressOrder
        ? opts.spendStrategy.addressOrder
        : ([
            'nativeSegwit',
            'taproot',
            'nestedSegwit',
            'legacy',
          ] as AddressType[]),
      utxoSortGreatestToLeast: opts?.spendStrategy?.utxoSortGreatestToLeast
        ? opts.spendStrategy.utxoSortGreatestToLeast
        : true,
    },
  }

  const accounts = generateWallet({
    mnemonic,
    options,
  })
  return accounts as Account
}

const generateWallet = ({
  mnemonic,
  options,
}: {
  mnemonic?: string
  options?: MnemonicToAccountOptions
}) => {
  const toXOnly = (pubKey: Buffer) =>
    pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)

  if (!mnemonic) {
    throw Error('mneominc not given')
  }

  let pathLegacy = `m/44'/0'/0'/0/${options.index}`
  let pathSegwitNested = `m/49'/0'/0'/0/${options.index}`
  let pathSegwit = `m/84'/0'/0'/0/${options.index}`
  let pathTaproot = `m/86'/0'/0'/0/${options.index}`
  //unisat accomadation
  if (options.network === bitcoin.networks.testnet) {
    pathLegacy = `m/44'/1'/0'/0/${options.index}`
    pathSegwitNested = `m/49'/1'/0'/0/${options.index}`
    pathSegwit = `m/84'/1'/0'/0/${options.index}`
    pathTaproot = `m/86'/1'/0'/0/${options.index}`
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed)
  const xpriv = root.toBase58()

  // Legacy
  const childLegacy = root.derivePath(pathLegacy)
  const pubkeyLegacy = childLegacy.publicKey
  const privateKeyLegacy = childLegacy.privateKey
  const addressLegacy = bitcoin.payments.p2pkh({
    pubkey: pubkeyLegacy,
    network: options.network,
  })
  const legacy = {
    pubkey: pubkeyLegacy.toString('hex'),
    privateKey: privateKeyLegacy.toString('hex'),
    address: addressLegacy.address,
  }

  // Nested Segwit
  const childSegwitNested = root.derivePath(pathSegwitNested)
  const pubkeySegwitNested = childSegwitNested.publicKey
  const privateKey = childSegwitNested.privateKey
  const addressSegwitNested = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({
      pubkey: pubkeySegwitNested,
      network: options.network,
    }),
  })
  const nestedSegwit = {
    pubkey: pubkeySegwitNested.toString('hex'),
    privateKey: privateKey.toString('hex'),
    address: addressSegwitNested.address,
  }

  // Native Segwit
  const childSegwit = root.derivePath(pathSegwit)
  const pubkeySegwit = childSegwit.publicKey
  const privateKeySegwit = childSegwit.privateKey
  const addressSegwit = bitcoin.payments.p2wpkh({
    pubkey: pubkeySegwit,
    network: options.network,
  })
  const nativeSegwit = {
    pubkey: pubkeySegwit.toString('hex'),
    privateKey: privateKeySegwit.toString('hex'),
    address: addressSegwit.address,
  }

  // Taproot
  const childTaproot = root.derivePath(pathTaproot)
  const pubkeyTaproot = childTaproot.publicKey
  const privateKeyTaproot = childTaproot.privateKey
  const pubkeyTaprootXOnly = toXOnly(pubkeyTaproot)

  const addressTaproot = bitcoin.payments.p2tr({
    internalPubkey: pubkeyTaprootXOnly,
    network: options.network,
  })
  const taproot = {
    pubkey: pubkeySegwitNested.toString('hex'),
    pubKeyXOnly: pubkeyTaprootXOnly.toString('hex'),
    privateKey: privateKeyTaproot.toString('hex'),
    address: addressTaproot.address,
  }

  return {
    taproot,
    nativeSegwit,
    nestedSegwit,
    legacy,
    spendStrategy: options.spendStrategy,
    network: options.network,
  }
}

export interface Account {
  taproot: {
    pubkey: string
    pubKeyXOnly: string
    privateKey: string
    address: string
  }
  nativeSegwit: {
    pubkey: string
    privateKey: string
    address: string
  }
  nestedSegwit: {
    pubkey: string
    privateKey: string
    address: string
  }
  legacy: {
    pubkey: string
    privateKey: string
    address: string
  }
  spendStrategy: SpendStrategy
  network: bitcoin.Network
}

export type AddressType = 'nativeSegwit' | 'taproot' | 'nestedSegwit' | 'legacy'

export interface SpendStrategy {
  addressOrder: AddressType[]
  utxoSortGreatestToLeast: boolean
}
