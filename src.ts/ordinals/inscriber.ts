import * as ecc from '@bitcoinerlab/secp256k1'
import * as bitcoin from 'bitcoinjs-lib'
import { Tapleaf } from 'bitcoinjs-lib/src/types'

import { witnessScriptBuilder } from './witness'
import { UnspentOutput } from '../shared/interface'

bitcoin.initEccLib(ecc)

export class Inscriber {
  private mediaType: string
  private mediaContent: string
  private pubKey: string
  private meta: any
  private postage: number
  private address: string
  private destinationAddress: string
  private payment: bitcoin.payments.Payment | null = null
  private witnessScripts: Record<'inscription' | 'recovery', Buffer | null> = {
    inscription: null,
    recovery: null,
  }
  private taprootTree!: [Tapleaf, Tapleaf]

  public inputs: any[]
  public outputs: any[]

  constructor({
    address,
    changeAddress,
    destinationAddress,
    pubKey,
    feeRate,
    postage,
    mediaContent,
    mediaType,
    outputs = [],
    meta,
  }) {
    if (!pubKey || !changeAddress || !mediaContent) {
      throw new Error('Invalid options provided')
    }
    this.pubKey = pubKey
    this.destinationAddress = destinationAddress
    this.mediaType = mediaType
    this.mediaContent = mediaContent
    this.meta = meta
    this.postage = postage
    this.address = address
  }

  private getMetadata() {
    return this.meta //&& this.encodeMetadata ? encodeObject(this.meta) : this.meta
  }

  buildWitness() {
    this.witnessScripts = {
      inscription: witnessScriptBuilder({
        mediaContent: this.mediaContent,
        mediaType: this.mediaType,
        meta: this.getMetadata(),
        pubKeyHex: this.pubKey,
      }),
      recovery: witnessScriptBuilder({
        mediaContent: this.mediaContent,
        mediaType: this.mediaType,
        meta: this.getMetadata(),
        pubKeyHex: this.pubKey,
        recover: true,
      }),
    }
  }

  getInscriptionRedeemScript(): bitcoin.payments.Payment['redeem'] {
    return {
      output: this.witnessScripts.inscription!,
      redeemVersion: 192,
    }
  }

  buildTaprootTree() {
    this.buildWitness()
    this.taprootTree = [
      { output: this.witnessScripts.inscription! },
      { output: this.witnessScripts.recovery! },
    ]
  }

  async generateCommit() {
    this.buildTaprootTree()
    this.payment = bitcoin.payments.p2tr({
      internalPubkey: Buffer.from(this.pubKey, 'hex'),
      network: bitcoin.networks.bitcoin,
      scriptTree: this.taprootTree,
      redeem: this.getInscriptionRedeemScript(),
    })

    //estimate fees

    return {
      address: this.payment.address!,
      revealFee: null, //this.fee + this.outputAmount (price of fees )
    }
  }

  async build(utxo: UnspentOutput) {
    if (!this.payment) {
      throw new Error('Failed to build PSBT. Transaction not ready')
    }

    this.inputs = [
      {
        type: 'taproot',
        hash: utxo.txId,
        index: utxo.outputIndex,
        tapInternalKey: Buffer.from(this.pubKey, 'hex'),
        witnessUtxo: {
          script: this.payment.output!,
          value: utxo.satoshis,
        },
        tapLeafScript: [
          {
            leafVersion: this.payment.redeemVersion!,
            script: this.payment.redeem!.output!,
            controlBlock:
              this.payment.witness![this.payment.witness!.length - 1],
          },
        ],
      },
    ]

    this.outputs = [
      {
        address: this.destinationAddress || this.address,
        value: this.postage,
      },
    ].concat(this.outputs)

    return { inputs: this.inputs, outputs: this.outputs }
  }
}
