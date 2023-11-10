import { UTXO_DUST } from '../shared/constants'

export async function buildOrdTx(
  psbtTx,
  segwitUtxos,
  allUtxos,
  toAddress,
  metaOutputValue,
  inscriptionId,
  fee
) {
  const { metaUtxos, nonMetaUtxos } = allUtxos.reduce(
    (acc, utxo) => {
      utxo.inscriptions.length
        ? acc.metaUtxos.push(utxo)
        : acc.nonMetaUtxos.push(utxo)
      return acc
    },
    { metaUtxos: [], nonMetaUtxos: [] }
  )

  const { nonMetaSegwitUtxos } = segwitUtxos.reduce(
    (acc, utxo) => {
      utxo.inscriptions.length
        ? acc.metaUtxos.push(utxo)
        : acc.nonMetaUtxos.push(utxo)
      return acc
    },
    { nonMetaSegwitUtxos: [] }
  )

  const matchedUtxo = metaUtxos.find((utxo) =>
    utxo.inscriptions.some((inscription) => inscription.id === inscriptionId)
  )
  if (!matchedUtxo || matchedUtxo.inscriptions.length > 1) {
    throw new Error(
      matchedUtxo
        ? 'Multiple inscriptions! Please split first.'
        : 'Inscription not detected.'
    )
  }
  let feeUtxo
  nonMetaSegwitUtxos.sort((a, b) => a.value - b.value)

  for (let utxo of nonMetaSegwitUtxos) {
    if (utxo.value > fee) {
      feeUtxo = utxo
      return
    }
    throw new Error('No available UTXOs')
  }

  psbtTx.addInput(feeUtxo, true)
  psbtTx.addInput(matchedUtxo)
  psbtTx.addOutput(toAddress, matchedUtxo.satoshis)

  psbtTx.outputs[0].value = metaOutputValue

  let inputSum = psbtTx.getTotalInput()
  for (const utxo of nonMetaUtxos) {
    if (inputSum < psbtTx.getTotalOutput() + (await psbtTx.calNetworkFee())) {
      psbtTx.addInput(utxo)
      inputSum += utxo.satoshis
    } else {
      break
    }
  }

  const remainingUnspent = psbtTx.getUnspent()
  if (remainingUnspent <= 0) {
    throw new Error('Not enough balance for the fee')
  }

  // add dummy output
  psbtTx.addChangeOutput(1)

  if (remainingUnspent - (await psbtTx.calNetworkFee()) >= UTXO_DUST) {
    psbtTx.getChangeOutput().value =
      remainingUnspent - (await psbtTx.calNetworkFee())
  } else {
    psbtTx.removeChangeOutput()
  }

  const psbt = await psbtTx.createSignedPsbt()
  psbtTx.dumpTx(psbt)

  return psbt
}
