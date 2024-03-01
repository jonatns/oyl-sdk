import * as bitcoin from 'bitcoinjs-lib'
import { ECPair, tweakSigner } from '../shared/utils'
import { ECPairInterface } from 'ecpair'

export const pathLegacy = "m/44'/1'/0'/0"
export const pathSegwitNested = "m/49'/1'/0'/0/0"
export const pathSegwit = "m/84'/1'/0'/0/0"
export const pathTaproot = "m/86'/1'/0'/0/0"

type walletInit = { privateKey: string; hdPath: string }[]

export class Signer {
  network: bitcoin.Network
  keyPairs: ECPairInterface[]
  addresses: walletInit
  constructor(network: bitcoin.Network, addresses: walletInit) {
    const keyPairs = addresses.map((key) =>
      ECPair.fromPrivateKey(Buffer.from(key.privateKey, 'hex'))
    )
    this.keyPairs = keyPairs
    this.network = network
  }

  async SignInput({
    rawPsbt,
    inputNumber,
  }: {
    rawPsbt: string
    inputNumber: number
  }) {
    let unSignedPsbt = bitcoin.Psbt.fromBase64(rawPsbt)

    const matchingPubKey = unSignedPsbt.inputHasPubkey(
      inputNumber,
      Buffer.from(this.keyPairs[0].publicKey)
    )
    if (!matchingPubKey) {
      throw new Error('Input does not match signer type')
    }

    unSignedPsbt.signInput(inputNumber, this.keyPairs[0])

    const signedPsbt = unSignedPsbt.finalizeInput(inputNumber).toBase64()

    return { signedPsbt: signedPsbt }
  }

  async SignTaprootInput({
    rawPsbt,
    inputNumber,
  }: {
    rawPsbt: string
    inputNumber: number
  }) {
    let unSignedPsbt = bitcoin.Psbt.fromBase64(rawPsbt, {
      network: this.network,
    })
    const tweakedSigner = tweakSigner(this.keyPairs[1])

    const matchingPubKey = unSignedPsbt.inputHasPubkey(
      inputNumber,
      Buffer.from(tweakedSigner.publicKey)
    )
    if (!matchingPubKey) {
      throw new Error('Input does not match signer type')
    }

    unSignedPsbt.signTaprootInput(inputNumber, tweakedSigner)

    const signedPsbt = unSignedPsbt.finalizeInput(inputNumber).toBase64()

    return { signedPsbt: signedPsbt }
  }

  async SignAllTaprootInputs({ rawPsbt }: { rawPsbt: string }) {
    let unSignedTxn = bitcoin.Psbt.fromBase64(rawPsbt)
    const tweakedSigner = tweakSigner(this.keyPairs[1])
    unSignedTxn.signAllInputs(tweakedSigner)
    const signedPsbt = unSignedTxn.finalizeAllInputs().toBase64()

    return { signedPsbt: signedPsbt }
  }

  async SignAllInputs({ rawPsbt }: { rawPsbt: string }) {
    let unSignedTxn = bitcoin.Psbt.fromBase64(rawPsbt)
    unSignedTxn.signAllInputs(this.keyPairs[0])
    const signedPsbt = unSignedTxn.finalizeAllInputs().toBase64()

    return { signedPsbt: signedPsbt }
  }

  async SignMessage({
    messageToSign,
    keyToUse,
  }: {
    messageToSign: string
    keyToUse: number
  }) {
    const signedMessage = this.keyPairs[keyToUse].sign(
      Buffer.from(messageToSign)
    )
    console.log(signedMessage)

    return signedMessage
  }
}
