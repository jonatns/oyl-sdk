import ecc from '@bitcoinerlab/secp256k1'
import { BIP32Factory } from 'bip32'
const bip32 = BIP32Factory(ecc)
import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
bitcoin.initEccLib(ecc)

export const generateWallet = (testnet: boolean, mnemonic?: string) => {
  const toXOnly = (pubKey: Buffer) =>
    pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)

  if (!mnemonic) {
    mnemonic = process.env.TESTNET_MNEMONIC
  }

  let pathLegacy = "m/44'/0'/0'/0"
  let pathSegwitNested = "m/49'/0'/0'/0/0"
  let pathSegwit = "m/84'/0'/0'/0/0"
  let pathTaproot = "m/86'/0'/0'/0/0"
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
  console.log('\nxpriv: ', root.toBase58())

  // Legacy
  const childSegwitLegacy = root.derivePath(pathLegacy)
  const pubkeySegwitLegacy = childSegwitLegacy.publicKey
  const addressLegacy = bitcoin.payments.p2pkh({
    pubkey: pubkeySegwitLegacy,
    network: network,
  })
  console.log('\nLegacy: ')
  console.log('pubkey: ', pubkeySegwitLegacy.toString('hex'))
  console.log('address: ', addressLegacy.address)

  // Nested Segwit
  const childSegwitNested = root.derivePath(pathSegwitNested)
  const pubkeySegwitNested = childSegwitNested.publicKey
  const addressSegwitNested = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({
      pubkey: pubkeySegwitNested,
      network,
    }),
  })
  console.log('\nNested Segwit: ')
  console.log('pubkey: ', pubkeySegwitNested.toString('hex'))
  console.log('address: ', addressSegwitNested.address)

  // Native Segwit
  const childSegwit = root.derivePath(pathSegwit)
  const pubkeySegwit = childSegwit.publicKey
  const privateKeySegwit = childSegwit.privateKey
  const addressSegwit = bitcoin.payments.p2wpkh({
    pubkey: pubkeySegwit,
    network,
  })
  console.log('\nNative Segwit: ')
  console.log('pubkey: ', pubkeySegwit.toString('hex'))
  console.log('privateKey: ', privateKeySegwit.toString('hex'))
  console.log('address: ', addressSegwit.address)

  // Taproot
  const childTaproot = root.derivePath(pathTaproot)
  const pubkeyTaproot = childTaproot.publicKey
  const privateKeyTaproot = childTaproot.privateKey
  const pubkeyTaprootXOnly = toXOnly(pubkeyTaproot)

  const addressTaproot = bitcoin.payments.p2tr({
    internalPubkey: pubkeyTaprootXOnly,
    network,
  })
  console.log('\nTaproot: ')
  console.log('pubkey: ', pubkeyTaproot.toString('hex'))
  console.log('privateKey: ', privateKeyTaproot.toString('hex'))
  console.log('pubkey XOnly: ', pubkeyTaprootXOnly.toString('hex'))
  console.log('address: ', addressTaproot.address)
}

generateWallet(
  true,
  'fiction drop width clap mask require that toe treat crater hand section'
)
