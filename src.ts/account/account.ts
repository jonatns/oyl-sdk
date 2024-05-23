import * as bitcoin from 'bitcoinjs-lib'
import {
  AddressType,
  addressNameToType,
  internalAddressTypeToName,
} from '../shared/interface'
import { ECPair } from '../shared/utils'
import Mnemonic from 'bitcore-mnemonic'
import {
  LEGACY_HD_PATH,
  NESTED_SEGWIT_HD_PATH,
  SEGWIT_HD_PATH,
  TAPROOT_HD_PATH,
} from '../oylib'

const publicKeyToAddress = (
  publicKey: string,
  type: AddressType,
  network: bitcoin.Network
) => {
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

const hdPathToAddressType = (hdPath: string) => {
  switch (hdPath) {
    case SEGWIT_HD_PATH:
      return AddressType.P2WPKH
    case NESTED_SEGWIT_HD_PATH:
      return AddressType.P2SH_P2WPKH
    case TAPROOT_HD_PATH:
      return AddressType.P2TR
    case LEGACY_HD_PATH:
      return AddressType.P2PKH
    default:
      throw Error('unknown hd path')
  }
}

interface SingleAccount {
  [addressKeyValue: string]: {
    pubkey: string
    addressType: string
    btcAddress: string
  }
}

interface AllAccounts {
  segwit: SingleAccount
  taproot: SingleAccount
  nestedSegwit: SingleAccount
  legacy: SingleAccount
}

export class Account {
  mnemonicObject: Mnemonic
  constructor(mnemonic: string) {
    this.mnemonicObject = new Mnemonic(mnemonic)
  }

  mnemonicToAccount(network: bitcoin.Network, hdPath: string) {
    const child = this.mnemonicObject
      .toHDPrivateKey(undefined, network)
      .deriveChild(hdPath)
    const ecpair = ECPair.fromPrivateKey(child.privateKey.toBuffer())
    const pubkey = ecpair.publicKey.toString('hex')
    const addressType = hdPathToAddressType(hdPath)
    const addressKeyValue = internalAddressTypeToName[addressType]
    const btcAddress = publicKeyToAddress(pubkey, addressType, network)
    return {
      pubkey: pubkey,
      addressType: addressNameToType[addressKeyValue],
      btcAddress: btcAddress,
    }
  }

  allAddresses(network: bitcoin.Network): AllAccounts {
    const paths = [
      SEGWIT_HD_PATH,
      TAPROOT_HD_PATH,
      NESTED_SEGWIT_HD_PATH,
      LEGACY_HD_PATH,
    ]
    const mnemonic = this.mnemonicObject
    let allAccounts = {} as AllAccounts

    for (const path of paths) {
      const hdObject = mnemonic
        .toHDPrivateKey(undefined, network)
        .deriveChild(path)
      const ecpair = ECPair.fromPrivateKey(hdObject.privateKey.toBuffer())
      const pubkey = ecpair.publicKey.toString('hex')
      const addressType = hdPathToAddressType(path)
      const addressKeyValue = internalAddressTypeToName[addressType]
      const btcAddress = publicKeyToAddress(pubkey, addressType, network)
      const additionalSingleAccount: SingleAccount = {
        [addressKeyValue]: {
          pubkey: pubkey,
          addressType: addressNameToType[addressKeyValue],
          btcAddress: btcAddress,
        },
      } as SingleAccount
      allAccounts = { ...allAccounts, ...additionalSingleAccount }
    }
    return allAccounts
  }
}
