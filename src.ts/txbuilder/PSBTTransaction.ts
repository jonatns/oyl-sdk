import { UTXO_DUST } from '../shared/constants'
import * as bitcoin from 'bitcoinjs-lib'
import { assertHex, utxoToInput, validator } from '../shared/utils'
import {
  AddressType,
  UnspentOutput,
  TxInput,
  TxOutput,
  ToSignInput,
} from '../shared/interface'
import { address as PsbtAddress } from 'bitcoinjs-lib'

export class PSBTTransaction {
  private inputs: TxInput[] = []
  public outputs: TxOutput[] = []
  private changeOutputIndex = -1
  private signer: any
  private address: string
  public changedAddress: string
  private network: bitcoin.Network = bitcoin.networks.bitcoin
  private feeRate: number
  private pubkey: string
  private enableRBF = false

  /**
   * Creates an instance of PSBTTransaction.
   * @param signer - Signer method bound to the HdKeyring.
   * @param address - Address associated with the transaction.
   * @param pubkey - Public key for the transaction.
   * @param feeRate - The fee rate in satoshis per byte.
   */
  constructor(
    signer,
    address,
    publicKey,
    feeRate,
    segwitSigner?,
    segwitPubKey?
  ) {
    this.signer = signer
    this.address = address
    this.pubkey = publicKey
    this.feeRate = feeRate || 5
  }

  setEnableRBF(enable: boolean) {
    this.enableRBF = enable
  }

  setChangeAddress(address: string) {
    this.changedAddress = address
  }

  addInput(utxo: UnspentOutput) {
    this.inputs.push(utxoToInput(utxo, Buffer.from(this.pubkey, 'hex')))
  }

  getTotalInput() {
    return this.inputs.reduce((pre, cur) => pre + cur.data.witnessUtxo.value, 0)
  }

  getTotalOutput() {
    return this.outputs.reduce((pre, cur) => pre + cur.value, 0)
  }

  getUnspent() {
    return this.getTotalInput() - this.getTotalOutput()
  }

  async isEnoughFee() {
    const psbt1 = await this.createSignedPsbt()
    if (psbt1.getFeeRate() >= this.feeRate) {
      return true
    } else {
      return false
    }
  }

  async calNetworkFee() {
    const psbt = await this.createSignedPsbt()
    let txSize = psbt.extractTransaction(true).toBuffer().length
    psbt.data.inputs.forEach((v) => {
      if (v.finalScriptWitness) {
        txSize -= v.finalScriptWitness.length * 0.75
      }
    })
    const fee = Math.ceil(txSize * this.feeRate)
    return fee
  }

  addOutput(address: string, value: number) {
    this.outputs.push({
      address,
      value,
    })
  }

  getOutput(index: number) {
    return this.outputs[index]
  }

  addChangeOutput(value: number) {
    this.outputs.push({
      address: this.changedAddress,
      value,
    })
    this.changeOutputIndex = this.outputs.length - 1
  }

  getChangeOutput() {
    return this.outputs[this.changeOutputIndex]
  }

  getChangeAmount() {
    const output = this.getChangeOutput()
    return output ? output.value : 0
  }

  removeChangeOutput() {
    this.outputs.splice(this.changeOutputIndex, 1)
    this.changeOutputIndex = -1
  }

  removeRecentOutputs(count: number) {
    this.outputs.splice(-count)
  }

  /**
   * Formats the inputs for signing based on the given PSBT and whether it is a reveal transaction.
   * @param { bitcoin.Psbt} psbt |  - The PSBT in hex string format or Psbt instance.
   * @returns {Promise<ToSignInput[]>} A promise that resolves to an array of inputs to sign.
   */
  formatOptionsToSignInputs = async (psbt: bitcoin.Psbt) => {
    let toSignInputs: ToSignInput[] = []
    const psbtNetwork = bitcoin.networks.bitcoin

    psbt.data.inputs.forEach((v, index: number) => {
      console.log({ v })
      console.log({ inputScript: v })
      let script: any = null
      let value = 0
      const isSigned = v.finalScriptSig || v.finalScriptWitness
      const lostInternalPubkey = !v.tapInternalKey
      if (v.witnessUtxo) {
        script = v.witnessUtxo.script
        value = v.witnessUtxo.value
      } else if (v.nonWitnessUtxo) {
        const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo)
        const output = tx.outs[psbt.txInputs[index].index]
        script = output.script
        value = output.value
      }

      if (!isSigned && lostInternalPubkey) {
        const tapInternalKey = assertHex(Buffer.from(this.pubkey, 'hex'))
        const p2tr = bitcoin.payments.p2tr({
          internalPubkey: tapInternalKey,
          network: psbtNetwork,
        })

        const isSameScript =
          v.witnessUtxo?.script.toString('hex') == p2tr.output?.toString('hex')

        if (isSameScript) {
          v.tapInternalKey = tapInternalKey
        }
      }

      toSignInputs.push({
        index: index,
        publicKey: this.pubkey,
        sighashTypes: v.sighashType ? [v.sighashType] : undefined,
      })
    })

    return { psbt, toSignInputs }
  }

  async signInputs(psbt: bitcoin.Psbt, toSignInputs: ToSignInput[]) {
    try {
      const taprootInputs: ToSignInput[] = []
      const segwitInputs: ToSignInput[] = []
      toSignInputs.forEach(({ index, publicKey }) => {
        if (publicKey === this.pubkey) {
          taprootInputs.push(toSignInputs[index])
        }
        if (publicKey === this.segwitPubKey) {
          segwitInputs.push(toSignInputs[index])
        }
      })

      if (segwitInputs.length > 0) {
        await this.signer(psbt, segwitInputs)
      } else if (taprootInputs.length > 0) {
        await this.signer(psbt, taprootInputs)
      } else {
        console.error('NO INPUTS!')
      }
    } catch (e) {
      console.error(e)
    }
  }

  async createSignedPsbt() {
    const psbt = new bitcoin.Psbt({ network: this.network })

    this.inputs.forEach((v, index) => {
      if (v.utxo.addressType === AddressType.P2PKH) {
        //@ts-ignore
        psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = true
      }
      psbt.addInput(v.data)
      if (this.enableRBF) {
        psbt.setInputSequence(index, 0xfffffffd) // support RBF
      }
    })

    this.outputs.forEach((v) => {
      psbt.addOutput(v)
    })

    await this.signPsbt(psbt)

    return psbt
  }

  /**
   * Signs the provided PSBT with the available keys.
   * @param {bitcoin.Psbt} psbt - The PSBT to sign.
   * @returns {Promise<bitcoin.Psbt>} A promise that resolves to the signed PSBT.
   */

  async signPsbt(psbt: bitcoin.Psbt) {
    try {
      const {
        psbt: formattedPsbt,
        toSignInputs,
      }: { psbt: bitcoin.Psbt; toSignInputs: ToSignInput[] } =
        await this.formatOptionsToSignInputs(psbt)
      await this.signInputs(formattedPsbt, toSignInputs)

      return formattedPsbt
    } catch (e) {
      console.log(e)
    }
  }

  async generate(autoAdjust: boolean) {
    // Try to estimate fee
    const unspent = this.getUnspent()
    this.addChangeOutput(Math.max(unspent, 0))
    const psbt1 = await this.createSignedPsbt()
    // this.dumpTx(psbt1);
    this.removeChangeOutput()

    // todo: support changing the feeRate
    const txSize = psbt1.extractTransaction().toBuffer().length
    const fee = txSize * this.feeRate

    if (unspent > fee) {
      const left = unspent - fee
      if (left > UTXO_DUST) {
        this.addChangeOutput(left)
      }
    } else {
      if (autoAdjust) {
        this.outputs[0].value -= fee - unspent
      }
    }
    const psbt2 = await this.createSignedPsbt()
    const tx = psbt2.extractTransaction()

    const rawtx = tx.toHex()
    const toAmount = this.outputs[0].value
    return {
      fee: psbt2.getFee(),
      rawtx,
      toSatoshis: toAmount,
      estimateFee: fee,
    }
  }

  async dumpTx(psbt) {
    const tx = psbt.extractTransaction()
    const size = tx.toBuffer().length
    const feePaid = psbt.getFee()
    const feeRate = (feePaid / size).toFixed(4)

    console.log(`
=============================================================================================
Summary
  txid:     ${tx.getId()}
  Size:     ${tx.byteLength()}
  Fee Paid: ${psbt.getFee()}
  Fee Rate: ${feeRate} sat/B
  Detail:   ${psbt.txInputs.length} Inputs, ${psbt.txOutputs.length} Outputs
----------------------------------------------------------------------------------------------
Inputs
${this.inputs
        .map((input, index) => {
          const str = `
=>${index} ${input.data.witnessUtxo.value} Sats
        lock-size: ${input.data.witnessUtxo.script.length}
        via ${input.data.hash} [${input.data.index}]
`
          return str
        })
        .join('')}
total: ${this.getTotalInput()} Sats
----------------------------------------------------------------------------------------------
Outputs
${this.outputs
        .map((output, index) => {
          const str = `
=>${index} ${output.address} ${output.value} Sats`
          return str
        })
        .join('')}

total: ${this.getTotalOutput() - feePaid} Sats
=============================================================================================
    `)
  }
}