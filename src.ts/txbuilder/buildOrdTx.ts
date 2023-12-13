import * as bitcoin from 'bitcoinjs-lib'
import { PSBTTransaction } from './PSBTTransaction'
import { getRawTxnHashFromTxnId } from '../shared/utils'
import { getAddressType } from '../transactions'

export type Utxo = {
  txId: string
  outputIndex: number
  satoshis: number
  scriptPk: string
  addressType: number
  address: string
  inscriptions: any[]
  confirmations: number
}

export async function buildOrdTx({
  psbtTx,
  allUtxos,
  toAddress,
  metaOutputValue,
  feeRate,
  inscriptionId,
  taprootAddress,
  payFeesWithSegwit,
  segwitAddress,
  segwitUtxos,
  segwitPubKey,
}: {
  psbtTx: PSBTTransaction | bitcoin.Psbt | any
  allUtxos: any[]
  toAddress: string
  metaOutputValue?: any
  feeRate: number
  inscriptionId?: string
  taprootAddress: string
  payFeesWithSegwit: boolean
  segwitAddress?: string
  segwitUtxos?: any[]
  segwitPubKey?: string
}) {
  const { metaUtxos, nonMetaUtxos } = allUtxos.reduce(
    (acc, utxo) => {
      utxo.inscriptions.length
        ? acc.metaUtxos.push(utxo)
        : acc.nonMetaUtxos.push(utxo)
      return acc
    },
    { metaUtxos: [], nonMetaUtxos: [] }
  )

  await addInscriptionUtxo({
    metaUtxos: metaUtxos,
    inscriptionId: inscriptionId,
    toAddress: toAddress,
    psbtTx: psbtTx,
  })

  psbtTx.outputs[0].value = metaOutputValue

  await getUtxosForFees({
    payFeesWithSegwit: payFeesWithSegwit,
    psbtTx: psbtTx,
    feeRate: feeRate,
    taprootUtxos: nonMetaUtxos,
    taprootAddress: taprootAddress,
    segwitUtxos: segwitUtxos,
    segwitAddress: segwitAddress,
    segwitPubKey: segwitPubKey,
  })

  const remainingUnspent = psbtTx.getUnspent()
  if (remainingUnspent <= 0) {
    throw new Error('Not enough balance for the fee')
  }

  const psbt = await psbtTx.createSignedPsbt()

  psbtTx.dumpTx(psbt)

  return psbt
}

export const getUtxosForFees = async ({
  payFeesWithSegwit,
  psbtTx,
  feeRate,
  taprootUtxos,
  taprootAddress,
  segwitUtxos,
  segwitAddress,
  segwitPubKey,
  utxoToSend,
}: {
  payFeesWithSegwit: boolean
  psbtTx: bitcoin.Psbt
  feeRate: number
  taprootUtxos: Utxo[]
  taprootAddress: string
  segwitUtxos?: Utxo[]
  segwitAddress?: string
  segwitPubKey?: string
  utxoToSend?: Utxo[]
}) => {
  try {
    if (payFeesWithSegwit && segwitUtxos) {
      await addSegwitFeeUtxo({
        segwitUtxos: segwitUtxos,
        feeRate: feeRate,
        psbtTx: psbtTx,
        segwitAddress: segwitAddress,
        segwitPubKey: segwitPubKey,
        utxoToSend: utxoToSend,
      })
    } else {
      await addTaprootFeeUtxo({
        taprootUtxos: taprootUtxos,
        feeRate: feeRate,
        psbtTx: psbtTx,
        taprootAddress: taprootAddress,
        utxoToSend: utxoToSend,
      })
    }
    return
  } catch (error) {
    console.log(error)
  }
}

const addSegwitFeeUtxo = async ({
  segwitUtxos,
  feeRate,
  psbtTx,
  segwitAddress,
  segwitPubKey,
  utxoToSend,
}: {
  segwitUtxos: {
    txId: string
    outputIndex: number
    satoshis: number
    scriptPk: string
    addressType: number
    address: string
    inscriptions: any[]
  }[]
  feeRate: number
  psbtTx: bitcoin.Psbt
  segwitAddress: string
  segwitPubKey: string
  utxoToSend?: Utxo[]
}) => {
  try {
    const { nonMetaSegwitUtxos } = segwitUtxos.reduce(
      (acc, utxo) => {
        utxo.inscriptions.length > 0
          ? acc.metaUtxos.push(utxo)
          : acc.nonMetaSegwitUtxos.push(utxo)
        return acc
      },
      { metaUtxos: [], nonMetaSegwitUtxos: [] }
    )

    nonMetaSegwitUtxos.sort((a, b) => b.satoshis - a.satoshis)

    const inputCount = psbtTx.txInputs.length === 0 ? 1 : psbtTx.txInputs.length

    const vB = inputCount * 1 * 149 + 3 * 32 + 12
    const fee = vB * feeRate

    const feeUtxos = findUtxosForFees(nonMetaSegwitUtxos, fee)

    if (!feeUtxos) {
      throw new Error('No available UTXOs')
    }
    const addressType = getAddressType(segwitAddress)
    let redeemScript

    if (addressType === 1) {
      const p2shObj = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2sh({
          pubkey: Buffer.from(segwitPubKey, 'hex'),
          network: bitcoin.networks.bitcoin,
        }),
      })

      redeemScript = p2shObj.redeem.output
    }
    if (addressType === 2) {
      try {
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(segwitPubKey, 'hex'),
          network: bitcoin.networks.bitcoin,
        })

        const p2sh = bitcoin.payments.p2sh({
          redeem: p2wpkh,
          network: bitcoin.networks.bitcoin,
        })

        redeemScript = p2sh.redeem.output
      } catch (error) {
        console.log(error)
      }
    }

    const usableUtxo = async (feeUtxo: Utxo) => {
      for (let j = 0; j < utxoToSend.length; j++) {
        if (feeUtxo.txId === utxoToSend[j].txId) return false
      }
    }

    for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
      if (await usableUtxo(feeUtxos.selectedUtxos[i])) {
        psbtTx.addInput({
          hash: feeUtxos.selectedUtxos[i].txId,
          index: feeUtxos.selectedUtxos[i].outputIndex,
          witnessUtxo: {
            value: feeUtxos.selectedUtxos[i].satoshis,
            script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
          },
          redeemScript: redeemScript,
        })
        psbtTx.addOutput({
          address: segwitAddress,
          value: Math.floor(feeUtxos.change),
        })
      }
      return
    }
  } catch (e) {
    console.error(e)
    return
  }
}

const addTaprootFeeUtxo = async ({
  taprootUtxos,
  feeRate,
  psbtTx,
  taprootAddress,
  utxoToSend,
}: {
  taprootUtxos: Utxo[]
  feeRate: number
  psbtTx: bitcoin.Psbt
  taprootAddress: string
  utxoToSend?: Utxo[]
}) => {
  const { nonMetaTaprootUtxos } = taprootUtxos.reduce(
    (acc, utxo) => {
      utxo.inscriptions.length > 0 || utxo.satoshis === 546
        ? acc.metaUtxos.push(utxo)
        : acc.nonMetaTaprootUtxos.push(utxo)
      return acc
    },
    { metaUtxos: [], nonMetaTaprootUtxos: [] }
  )

  nonMetaTaprootUtxos.sort((a, b) => b.satoshis - a.satoshis)

  const inputCount = psbtTx.txInputs.length === 0 ? 1 : psbtTx.txInputs.length

  const vB = inputCount * 149 + 3 * 32 + 12
  const fee = vB * feeRate

  const feeUtxos = findUtxosForFees(nonMetaTaprootUtxos, fee)

  if (!feeUtxos) {
    throw new Error('No available UTXOs')
  }

  const usableUtxo = async (feeUtxo: Utxo) => {
    for (let j = 0; j < utxoToSend.length; j++) {
      if (feeUtxo.txId === utxoToSend[j].txId) return false
    }
  }

  for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
    if (await usableUtxo(feeUtxos.selectedUtxos[i])) {
      psbtTx.addInput({
        hash: feeUtxos.selectedUtxos[i].txId,
        index: feeUtxos.selectedUtxos[i].outputIndex,
        witnessUtxo: {
          value: feeUtxos.selectedUtxos[i].satoshis,
          script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
        },
      })
      psbtTx.addOutput({
        address: taprootAddress,
        value: Math.floor(feeUtxos.change),
      })
    }

    return
  }
}

export const addInscriptionUtxo = async ({
  metaUtxos,
  inscriptionId,
  toAddress,
  psbtTx,
}: {
  metaUtxos: any[]
  inscriptionId: string
  toAddress: string
  psbtTx: bitcoin.Psbt | any
}) => {
  const matchedUtxo = metaUtxos.find((utxo) => {
    return utxo.inscriptions.some(
      (inscription) => inscription.id === inscriptionId
    )
  })
  if (!matchedUtxo || matchedUtxo.inscriptions.length > 1) {
    throw new Error(
      matchedUtxo
        ? 'Multiple inscriptions! Please split first.'
        : 'Inscription not detected.'
    )
  }

  psbtTx.addInput({
    hash: matchedUtxo.txId,
    index: matchedUtxo.outputIndex,
    witnessUtxo: {
      value: matchedUtxo.satoshis,
      script: Buffer.from(matchedUtxo.scriptPk, 'hex'),
    },
  })
  psbtTx.addOutput({
    address: toAddress,
    value: Math.floor(matchedUtxo.satoshis),
  })
  return
}

export function findUtxosForFees(utxos: Utxo[], amount: number) {
  let totalSatoshis = 0
  const selectedUtxos: Utxo[] = []

  for (const utxo of utxos) {
    if (utxo.confirmations <= 0) break
    if (totalSatoshis >= amount) break

    selectedUtxos.push(utxo)
    totalSatoshis += utxo.satoshis
  }

  if (totalSatoshis >= amount) {
    return {
      selectedUtxos,
      totalSatoshis,
      change: totalSatoshis - amount,
    }
  } else {
    return null
  }
}
