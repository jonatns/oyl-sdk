import * as ecc from '@bitcoinerlab/secp256k1'
import * as bitcoin from 'bitcoinjs-lib'
import { Tapleaf } from 'bitcoinjs-lib/src/types'

import { witnessScriptBuilder } from './witness'
import { UnspentOutput } from '../shared/interface'

bitcoin.initEccLib(ecc)

/**
 * Represents a util to inscribe ordinals.
 */
export class Inscriber {
  private mediaType: string
  private mediaContent: string
  private pubKey: string
  private meta: Record<string, any> | null
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

  /**
   * Initializes a new instance of the Inscriber.
   * @param options - Initialization options for the inscriber.
   */
  constructor({
    address,
    destinationAddress,
    pubKey,
    postage,
    mediaContent,
    mediaType,
    outputs = [],
    meta = {},
  }: {
    address: string,
    destinationAddress: string,
    pubKey: string,
    postage: number,
    mediaContent: string,
    mediaType: string,
    outputs?: any[],
    meta?: Record<string, any>
  }) {
    if (!pubKey || !mediaContent) {
      throw new Error('Invalid options provided')
    }
    this.pubKey = pubKey
    this.destinationAddress = destinationAddress
    this.mediaType = mediaType
    this.mediaContent = mediaContent
    this.meta = meta
    this.postage = postage
    this.address = address
    this.outputs = outputs
  }

  /**
   * Retrieves the metadata of the inscription.
   * @returns The metadata of the inscription.
   */
  private getMetadata(): Record<string, any> | null {
    return this.meta
  }

  /**
   * Constructs the witness scripts for the inscription.
   */
  buildWitness(): void {
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

  /**
   * Retrieves the redeem script for the inscription.
   * @returns The redeem script.
   */
  getInscriptionRedeemScript(): bitcoin.payments.Payment['redeem'] {
    return {
      output: this.witnessScripts.inscription!,
      redeemVersion: 192,
    }
  }

  /**
   * Constructs the taproot tree for the transaction.
   */
  buildTaprootTree(): void {
    this.buildWitness()
    this.taprootTree = [
      { output: this.witnessScripts.inscription! },
      { output: this.witnessScripts.recovery! },
    ]
  }

  /**
   * Generates the commitment for the inscription.
   * @returns The generated commitment.
   */
  async generateCommit(): Promise<{ address: string, revealFee: null }> {
    this.buildTaprootTree()
    this.payment = bitcoin.payments.p2tr({
      internalPubkey: Buffer.from(this.pubKey, 'hex'),
      network: bitcoin.networks.bitcoin,
      scriptTree: this.taprootTree,
      redeem: this.getInscriptionRedeemScript(),
    })

    return {
      address: this.payment.address!,
      revealFee: null,
    }
  }

  /**
   * Builds the PSBT for the inscription.
   * @param utxo - The unspent transaction output to use.
   * @returns The generated PSBT inputs and outputs.
   */
  async build(utxo: UnspentOutput): Promise<{ inputs: any[], outputs: any[] }> {
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
            controlBlock: this.payment.witness![this.payment.witness!.length - 1],
          },
        ],
      },
    ]

    this.outputs = [
      {
        address: this.destinationAddress || this.address,
        value: this.postage,
      },
      ...this.outputs
    ]

    return { inputs: this.inputs, outputs: this.outputs }
  }
}
