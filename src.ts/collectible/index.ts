import { minimumFee } from '../btc'
import { Provider } from '../provider/provider'
import * as bitcoin from 'bitcoinjs-lib'
import { FormattedUtxo, accountSpendableUtxos } from '../utxo'
import { Account } from '../account'
import { formatInputsToSign } from '../shared/utils'
import { OylTransactionError } from '../errors'

export const sendTx = async ({
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
  try {
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
      address: account.taproot.address,
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

    let utxosToSend = gatheredUtxos

    if (!fee && gatheredUtxos.utxos.length > 1) {
      const txSize = minimumFee({
        taprootInputCount: gatheredUtxos.utxos.length,
        nonTaprootInputCount: 0,
        outputCount: 2,
      })
      finalFee = txSize * feeRate < 250 ? 250 : txSize * feeRate

      if (gatheredUtxos.totalAmount < finalFee) {
        utxosToSend = await accountSpendableUtxos({
          account,
          provider,
          spendAmount: finalFee,
        })
      }
    }

    for await (const utxo of utxosToSend.utxos) {
      psbt.addInput({
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPk, 'hex'),
          value: utxo.satoshis,
        },
      })
    }

    const changeAmount = utxosToSend.totalAmount - finalFee

    psbt.addOutput({
      address: account[account.spendStrategy.changeAddress].address,
      value: changeAmount,
    })

    const formattedPsbtTx = await formatInputsToSign({
      _psbt: psbt,
      senderPublicKey: account.taproot.pubkey,
      network: provider.network,
    })

    return { psbt: formattedPsbtTx.toBase64() }
  } catch (error) {
    throw new OylTransactionError(error)
  }
}

export const findCollectible = async ({
  address,
  provider,
  inscriptionId,
}: {
  address: string
  provider: Provider
  inscriptionId: string
}) => {
  const collectibleData: OrdCollectibleData =
    await provider.ord.getInscriptionById(inscriptionId)

  if (collectibleData.address !== address) {
    throw new Error('Inscription does not belong to fromAddress')
  }

  const inscriptionTxId = collectibleData.satpoint.split(':')[0]
  const inscriptionTxVOutIndex = collectibleData.satpoint.split(':')[1]
  const inscriptionUtxoDetails = await provider.esplora.getTxInfo(
    inscriptionTxId
  )
  const inscriptionUtxoData =
    inscriptionUtxoDetails.vout[inscriptionTxVOutIndex]

  const isSpentArray = await provider.esplora.getTxOutspends(inscriptionTxId)
  const isSpent = isSpentArray[inscriptionTxVOutIndex]

  if (isSpent.spent) {
    throw new Error('Inscription is missing')
  }
  return {
    txId: inscriptionTxId,
    voutIndex: inscriptionTxVOutIndex,
    data: inscriptionUtxoData,
  }
}

type OrdCollectibleData = {
  address: string
  children: any[]
  content_length: number
  content_type: string
  genesis_fee: number
  genesis_height: number
  inscription_id: string
  inscription_number: number
  next: string
  output_value: number
  parent: any
  previous: string
  rune: any
  sat: number
  satpoint: string
  timestamp: number
}
