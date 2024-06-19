/*
*
*
The  parent key should be able to be derived sequentially. The UI can select/change
the path parameters (e.g "44"/"49"/"86")
// */
import * as bitcoin from 'bitcoinjs-lib'
import { HdKeyring } from './hdKeyring'
import { AddressType } from '../shared/interface'

export function createWallet(
  hdPathString: string,
  type: AddressType,
  network: bitcoin.Network
) {
  // Create a new instance of HdKeyring with the provided hdPathString
  const keyring = new HdKeyring({ hdPath: hdPathString, network })
  // Add a single account to the keyring
  keyring.addAccounts(1, network)
  // Get the first account public key
  const accounts = keyring.getAccounts()
  const pubkey = accounts[0]
  const address = publicKeyToAddress(pubkey, type, network)
  if (address == null) throw Error('Invalid publickey or address type')
  const fullPayload = {}
  fullPayload['keyring'] = keyring
  fullPayload['address'] = address
  return fullPayload
}

export function publicKeyToAddress(
  publicKey: string,
  type: AddressType,
  network: bitcoin.Network
) {
  if (!publicKey) return null
  const pubkey = Buffer.from(publicKey, 'hex')
  if (type === AddressType.P2PKH) {
    const { address } = bitcoin.payments.p2pkh({
      pubkey,
      network,
    })
    return address || null
  } else if (type === AddressType.P2WPKH) {
    const { address } = bitcoin.payments.p2wpkh({
      pubkey,
      network,
    })
    return address || null
  } else if (type === AddressType.P2SH_P2WPKH) {
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey, network }),
    })
    return address || null
  } else if (type === AddressType.P2TR) {
    const { address } = bitcoin.payments.p2tr({
      internalPubkey: pubkey.slice(1, 33),
      network,
    })
    return address || null
  } else {
    return null
  }
}

export function isValidAddress(address: string, network: bitcoin.Network) {
  let error
  try {
    bitcoin.address.toOutputScript(address, network)
  } catch (e) {
    error = e
  }
  if (error) {
    return false
  } else {
    return true
  }
}

export async function importMnemonic(
  mnemonic: string,
  path: string,
  type: AddressType,
  network: bitcoin.Network
) {
  const keyring = new HdKeyring({
    mnemonic: mnemonic,
    hdPath: path,
    network,
  })

  // Add a single account to the keyring
  await keyring.addAccounts(1, network)
  // Get the first account public key
  const accounts = await keyring.getAccounts()
  const pubkey = accounts[0]
  const address = publicKeyToAddress(pubkey, type, network)
  if (address == null) throw Error('Invalid publickey or address type')
  const fullPayload = {}
  fullPayload['keyring'] = keyring
  fullPayload['address'] = address
  return fullPayload
}

export const addressFormats = {
  mainnet: {
    p2pkh: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2wpkh: /^(bc1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2tr: /^(bc1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
  },
  testnet: {
    p2pkh: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2wpkh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2tr: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
  },
  regtest: {
    p2pkh: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2wpkh: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
    p2tr: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
  },
}
