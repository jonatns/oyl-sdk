import * as bitcoin from 'bitcoinjs-lib'
import {
  AddressType,
  addressNameToType,
  internalAddressTypeToName,
} from '../shared/interface'
import { ECPair } from '../shared/utils'
import ecc from '@bitcoinerlab/secp256k1'
import { BIP32API, BIP32Factory, BIP32Interface } from 'bip32'
const bip32 = BIP32Factory(ecc)
import * as bip39 from 'bip39'
import * as dotenv from 'dotenv'
dotenv.config()

bitcoin.initEccLib(ecc)

import {
  LEGACY_HD_PATH,
  NESTED_SEGWIT_HD_PATH,
  Oyl,
  SEGWIT_HD_PATH,
  TAPROOT_HD_PATH,
} from '../oylib'
import { Provider } from '../provider/provider'
import { generateWallet } from '../tests/genWallet'

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

export class Account {
  mnemonic: string
  network: bitcoin.Network
  index?: number = 0
  provider: Provider
  constructor({
    mnemonic,
    network,
    index,
    provider,
  }: {
    mnemonic: string
    network: bitcoin.Network
    index?: number
    provider: Provider
  }) {
    this.mnemonic = mnemonic
    this.network = network
    this.index = index
    this.provider = provider
  }

  hdPathToAddressType = ({ hdPath }: { hdPath: string }) => {
    if (hdPath.startsWith("m/84'/0'/0'/")) {
      return AddressType.P2WPKH
    }
    if (hdPath.startsWith("m/49'/0'/0'/")) {
      return AddressType.P2SH_P2WPKH
    }
    if (hdPath.startsWith("m/86'/0'/0'/")) {
      return AddressType.P2TR
    }
    if (hdPath.startsWith("m/44'/0'/0'/")) {
      return AddressType.P2PKH
    }
    throw new Error('unknown hd path')
  }

  mnemonicToAccount({ hdPath }: { hdPath: string }) {
    const seed = bip39.mnemonicToSeedSync(this.mnemonic)
    const root = bip32.fromSeed(seed)
    const child = root.derivePath(hdPath)
    const pubkey = child.publicKey.toString('hex')
    const privateKey = child.privateKey.toString('hex')
    const addressType = this.hdPathToAddressType({ hdPath })
    const addressKeyValue = internalAddressTypeToName[addressType]
    const btcAddress = publicKeyToAddress(pubkey, addressType, this.network)
    return {
      pubkey: pubkey,
      addressType: addressNameToType[addressKeyValue],
      address: btcAddress,
      privateKey: privateKey,
    }
  }

  addresses() {
    const accounts = generateWallet(
      this.network === bitcoin.networks.testnet,
      this.mnemonic,
      this.index
    )
    return accounts
  }

  async spendableUtxos({ address }: { address: string }) {
    const utxos = await this.provider.esplora.getAddressUtxo(address)
    return utxos
  }
}
