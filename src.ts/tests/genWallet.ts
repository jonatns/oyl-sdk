import ecc from '@bitcoinerlab/secp256k1'
import { BIP32Factory } from 'bip32'
const bip32 = BIP32Factory(ecc)
import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
bitcoin.initEccLib(ecc)
import * as dotenv from 'dotenv'
dotenv.config()

export const generateWallet = (
  testnet: boolean,
  mnemonic?: string,
  index?: number
) => {
  const toXOnly = (pubKey: Buffer) =>
    pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)

  if (!mnemonic) {
    mnemonic = process.env.TESTNET_MNEMONIC
  }

  let pathLegacy = `m/44'/0'/0'/0/${index}`
  let pathSegwitNested = `m/49'/0'/0'/0/${index}`
  let pathSegwit = `m/84'/0'/0'/0/${index}`
  let pathTaproot = `m/86'/0'/0'/0/${index}`
  let network = bitcoin.networks.bitcoin

  /**
   * Need coin type of 1 for Testnet
   * See: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
   */
  if (testnet) {
    pathLegacy = "m/44'/1'/0'/0"
    pathSegwitNested = "m/49'/1'/0'/0/0"
    pathSegwit = "m/84'/1'/0'/0/0"
    pathTaproot = "m/86'/1'/0'/0/0"
    network = bitcoin.networks.testnet
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
    network: network,
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
      network,
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
    network,
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
    network,
  })
  const taproot = {
    pubkey: pubkeyTaproot.toString('hex'),
    pubKeyXOnly: pubkeyTaprootXOnly.toString('hex'),
    privateKey: privateKeyTaproot.toString('hex'),
    address: addressTaproot.address,
  }

  return {
    taproot,
    nativeSegwit,
    nestedSegwit,
    legacy,
  }
}

generateWallet(
  true,
  process.env.MAINNET_MNEMONIC //'rich baby hotel region tape express recipe amazing chunk flavor oven obtain'
)
