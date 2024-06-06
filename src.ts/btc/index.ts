import { OylTransactionError } from '../errors'
import { Provider } from '../provider/provider'
import * as bitcoin from 'bitcoinjs-lib'
import { FormattedUtxo, accountSpendableUtxos } from '../utxo'
import { calculateTaprootTxSize, formatInputsToSign } from '../shared/utils'
import { Account } from '../account'

export const sendTx = async ({
  toAddress,
  amount,
  feeRate,
  network,
  account,
  provider,
  fee,
}: {
  toAddress: string
  feeRate: number
  amount: number
  network: bitcoin.Network
  account: Account
  provider: Provider
  fee?: number
}) => {
  try {
    if (!feeRate) {
      feeRate = (await provider.esplora.getFeeEstimates())['1']
    }
    const psbt: bitcoin.Psbt = new bitcoin.Psbt({ network: network })
    const minFee = minimumFee({
      taprootInputCount: 1,
      nonTaprootInputCount: 0,
      outputCount: 2,
    })
    let calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
    let finalFee = fee ? fee : calculatedFee

    let gatheredUtxos: {
      totalAmount: number
      utxos: FormattedUtxo[]
    } = await accountSpendableUtxos({
      account,
      provider,
      spendAmount: finalFee + amount,
    })

    if (!fee && gatheredUtxos.utxos.length > 1) {
      const txSize = minimumFee({
        taprootInputCount: gatheredUtxos.utxos.length,
        nonTaprootInputCount: 0,
        outputCount: 2,
      })
      finalFee = txSize * feeRate < 250 ? 250 : txSize * feeRate

      if (gatheredUtxos.totalAmount < amount + finalFee) {
        gatheredUtxos = await accountSpendableUtxos({
          account,
          provider,
          spendAmount: finalFee + amount,
        })
      }
    }

    for (let i = 0; i < gatheredUtxos.utxos.length; i++) {
      psbt.addInput({
        hash: gatheredUtxos.utxos[i].txId,
        index: gatheredUtxos.utxos[i].outputIndex,
        witnessUtxo: {
          value: gatheredUtxos.utxos[i].satoshis,
          script: Buffer.from(gatheredUtxos.utxos[i].scriptPk, 'hex'),
        },
      })
    }

    psbt.addOutput({
      address: toAddress,
      value: amount,
    })

    const changeAmount = gatheredUtxos.totalAmount - (finalFee + amount)

    psbt.addOutput({
      address: account[account.spendStrategy.changeAddress].address,
      value: changeAmount,
    })

    const updatedPsbt = await formatInputsToSign({
      _psbt: psbt,
      senderPublicKey: account.taproot.pubkey,
      network,
    })

    return { psbt: updatedPsbt.toBase64(), fee: finalFee }
  } catch (error) {
    throw new OylTransactionError(error)
  }
}

export const minimumFee = ({
  taprootInputCount,
  nonTaprootInputCount,
  outputCount,
}: {
  taprootInputCount: number
  nonTaprootInputCount: number
  outputCount: number
}) => {
  return calculateTaprootTxSize(
    taprootInputCount,
    nonTaprootInputCount,
    outputCount
  )
}
