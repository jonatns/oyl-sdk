import { minimumFee } from '../btc'
import { Provider } from '../provider/provider'
import * as bitcoin from 'bitcoinjs-lib'
import {
  FormattedUtxo,
  accountSpendableUtxos,
  findCollectible,
  findUtxosToCoverAmount,
} from '../utxo'
import { Account } from '../account'
import { formatInputsToSign } from '../shared/utils'

export const sendCollectible = async ({
  account,
  inscriptionId,
  provider,
  toAddress,
  feeRate,
  fee,
}: {
  account: Account
  inscriptionId: string
  provider: Provider
  toAddress: string
  feeRate?: number
  fee?: number
}) => {
  const minFee = minimumFee({
    taprootInputCount: 1,
    nonTaprootInputCount: 0,
    outputCount: 2,
  })
  const calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
  let finalFee = fee ? fee : calculatedFee

  const gatheredUtxos: {
    totalAmount: number
    utxos: FormattedUtxo[]
  } = await accountSpendableUtxos({
    account,
    provider,
    spendAmount: finalFee,
  })

  let psbt = new bitcoin.Psbt({ network: provider.network })
  const { txId, voutIndex, data } = await findCollectible({
    account,
    provider,
    inscriptionId,
  })

  psbt.addInput({
    hash: txId,
    index: parseInt(voutIndex),
    witnessUtxo: {
      script: Buffer.from(data.scriptpubkey, 'hex'),
      value: data.value,
    },
  })

  psbt.addOutput({
    address: toAddress,
    value: data.value,
  })

  let utxosToSend = findUtxosToCoverAmount(gatheredUtxos.utxos, finalFee)

  if (utxosToSend?.selectedUtxos.length > 1) {
    const newTxSize = minimumFee({
      taprootInputCount: utxosToSend.selectedUtxos.length,
      nonTaprootInputCount: 0,
      outputCount: 2,
    })
    fee = newTxSize * feeRate < 250 ? 250 : newTxSize * feeRate
    utxosToSend = findUtxosToCoverAmount(gatheredUtxos.utxos, finalFee)
    if (utxosToSend.totalSatoshis < finalFee) {
      return { estimatedFee: finalFee, satsFound: gatheredUtxos.totalAmount }
    }
  }

  for await (const utxo of utxosToSend.selectedUtxos) {
    psbt.addInput({
      hash: utxo.txId,
      index: utxo.outputIndex,
      witnessUtxo: {
        script: Buffer.from(utxo.scriptPk, 'hex'),
        value: utxo.satoshis,
      },
    })
  }

  const changeAmount = fee
    ? utxosToSend.totalSatoshis - fee
    : utxosToSend.totalSatoshis - finalFee

  psbt.addOutput({
    address: account[account.spendStrategy.changeAddress].address,
    value: changeAmount,
  })

  const formattedPsbtTx = await formatInputsToSign({
    _psbt: psbt,
    senderPublicKey: account.taproot.pubkey,
    network: provider.network,
  })

  return { rawPsbt: formattedPsbtTx.toBase64() }
}
