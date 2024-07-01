import { UTXO_DUST } from '../shared/constants'
import * as bitcoin from 'bitcoinjs-lib'
import { assertHex, utxoToInput } from '../shared/utils'
import {
  AddressType,
  UnspentOutput,
  TxInput,
  TxOutput,
  ToSignInput,
} from '../shared/interface'
import { address as PsbtAddress } from 'bitcoinjs-lib'

export class OGPSBTTransaction {
  private inputs: TxInput[] = []
  public outputs: TxOutput[] = []
  private changeOutputIndex = -1
  private signer: any
  private address: string
  public changedAddress: string
  private network: bitcoin.Network

  private feeRate: number
  private pubkey: string
  private addressType: AddressType
  private enableRBF = true
  constructor(
    signer: any,
    address: string,
    pubkey: string,
    addressType: AddressType,
    network?: bitcoin.Network,
    feeRate?: number
  ) {
    this.signer = signer
    this.address = address
    this.pubkey = pubkey
    this.addressType = addressType
    this.feeRate = feeRate || 5
    this.network = network
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

  formatOptionsToSignInputs = async (
    _psbt: string | bitcoin.Psbt,
    isRevealTx: boolean = false
  ) => {
    let toSignInputs: ToSignInput[] = []
    const psbtNetwork = this.network

    const psbt =
      typeof _psbt === 'string'
        ? bitcoin.Psbt.fromHex(_psbt as string, { network: psbtNetwork })
        : (_psbt as bitcoin.Psbt)
    console.log(psbt.data.inputs)
    psbt.data.inputs.forEach((v, index) => {
      let script: any = null
      let value = 0
      if (v.witnessUtxo) {
        script = v.witnessUtxo.script
        value = v.witnessUtxo.value
      } else if (v.nonWitnessUtxo) {
        const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo)
        const output = tx.outs[psbt.txInputs[index].index]
        script = output.script
        value = output.value
      }
      const isSigned = v.finalScriptSig || v.finalScriptWitness
      if (script && !isSigned) {
        const address = PsbtAddress.fromOutputScript(script, psbtNetwork)
        if (isRevealTx || (!isRevealTx && this.address === address)) {
          toSignInputs.push({
            index,
            publicKey: this.pubkey,
            sighashTypes: v.sighashType ? [v.sighashType] : undefined,
          })
        }
      }
    })

    console.log('toSignInputs', toSignInputs)
    return toSignInputs
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

  async signPsbt(
    psbt: bitcoin.Psbt,
    autoFinalized = true,
    isRevealTx: boolean = false,
    indexToSign: [] = []
  ) {
    const psbtNetwork = this.network
    let toSignInputs: ToSignInput[] = []
    if (indexToSign.length >= 1) {
      for (let i = 0; i < indexToSign.length; i++) {
        toSignInputs.push({
          index: indexToSign[i],
          publicKey: this.pubkey,
        })
      }
    } else {
      toSignInputs = await this.formatOptionsToSignInputs(psbt, isRevealTx)
    }

    psbt.data.inputs.forEach((v, index) => {
      const isNotSigned = !(v.finalScriptSig || v.finalScriptWitness)
      const isP2TR = this.addressType === AddressType.P2TR
      const lostInternalPubkey = !v.tapInternalKey
      if (isNotSigned && isP2TR && lostInternalPubkey) {
        const tapInternalKey = assertHex(Buffer.from(this.pubkey, 'hex'))
        const { output } = bitcoin.payments.p2tr({
          internalPubkey: tapInternalKey,
          network: psbtNetwork,
        })
        if (v.witnessUtxo?.script.toString('hex') == output?.toString('hex')) {
          v.tapInternalKey = tapInternalKey
        }
      }
    })

    psbt = await this.signer(psbt, toSignInputs)
    if (autoFinalized) {
      console.log('autoFinalized')
      toSignInputs.forEach((v) => {
        psbt.finalizeInput(v.index)
      })
    }

    return psbt
  }

  async generate(autoAdjust: boolean) {
    // Try to estimate fee
    const unspent = this.getUnspent()
    this.addChangeOutput(Math.max(unspent, 0))
    const psbt1 = await this.createSignedPsbt()
    // this.dumpTx(psbt1);
    this.removeChangeOutput()

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
