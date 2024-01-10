import * as bitcoin from 'bitcoinjs-lib'
import { getAddressType } from '../transactions'
import { filterTaprootUtxos, getNetwork } from '../shared/utils'

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

export const getUtxosForFees = async ({
  payFeesWithSegwit,
  psbtTx,
  feeRate,
  taprootUtxos,
  taprootAddress,
  inscription,
  segwitUtxos,
  segwitAddress,
  segwitPubKey,
  utxosToSend,
  network,
}: {
  payFeesWithSegwit: boolean
  psbtTx: bitcoin.Psbt
  feeRate: number
  taprootUtxos: Utxo[]
  taprootAddress: string
  inscription?: { isInscription: boolean; inscriberAddress: string }
  segwitUtxos?: Utxo[]
  segwitAddress?: string
  segwitPubKey?: string
  utxosToSend?: { selectedUtxos: Utxo[]; totalSatoshis: number; change: number }
  network: bitcoin.Network
}) => {
  try {
    return await addSegwitFeeUtxo({
      taprootUtxos: taprootUtxos,
      segwitUtxos: segwitUtxos,
      feeRate: feeRate,
      psbtTx: psbtTx,
      segwitAddress: segwitAddress,
      segwitPubKey: segwitPubKey,
      utxosToSend: utxosToSend,
      taprootAddress: taprootAddress,
      inscription: inscription,
      network,
      payFeesWithSegwit: payFeesWithSegwit,
    })
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
  utxosToSend,
  taprootUtxos,
  taprootAddress,
  inscription,
  network,
  payFeesWithSegwit,
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
  utxosToSend?: { selectedUtxos: Utxo[]; totalSatoshis: number; change: number }
  taprootUtxos: Utxo[]
  taprootAddress: string
  inscription: { isInscription: boolean; inscriberAddress: string }
  network: bitcoin.Network
  payFeesWithSegwit: boolean
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

    const nonMetaTaprootUtxos = await filterTaprootUtxos({
      taprootUtxos: taprootUtxos,
    })

    const inputCount = psbtTx.txInputs.length === 0 ? 1 : psbtTx.txInputs.length
    const vB = inputCount * 1 * 149 + 3 * 32 + 12
    const fee = vB * feeRate

    const addressType = getAddressType(segwitAddress)
    let redeemScript

    if (addressType === 2) {
      const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(segwitPubKey, 'hex'),
        network: network,
      })
      redeemScript = p2wpkh.output
    }
    if (addressType === 3) {
      try {
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(segwitPubKey, 'hex'),
          network: network,
        })

        const p2sh = bitcoin.payments.p2sh({
          redeem: p2wpkh,
          network: network,
        })

        redeemScript = p2sh.redeem.output
      } catch (error) {
        console.log(error)
      }
    }
    if (utxosToSend) {
      let feeUtxos = payFeesWithSegwit
        ? findUtxosForFees(nonMetaSegwitUtxos, fee)
        : findUtxosForFees(nonMetaTaprootUtxos, fee)
      if (utxosToSend?.change) {
        if (utxosToSend?.change - fee >= 0) {
          return psbtTx.addOutput({
            address: payFeesWithSegwit ? segwitAddress : taprootAddress,
            value: Math.floor(utxosToSend.change - fee),
          })
        } else {
          feeUtxos = payFeesWithSegwit
            ? findUtxosForFees(nonMetaSegwitUtxos, fee - utxosToSend.change)
            : findUtxosForFees(nonMetaTaprootUtxos, fee - utxosToSend.change)
        }
      }
      if (!feeUtxos) {
        return await addTaprootFeeUtxo({
          taprootUtxos: taprootUtxos,
          feeRate: feeRate,
          psbtTx: psbtTx,
          taprootAddress: taprootAddress,
          utxosToSend: utxosToSend,
        })
      }

      for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
        if (
          usableUtxo(feeUtxos.selectedUtxos[i], utxosToSend?.selectedUtxos) &&
          confirmedUtxo(feeUtxos.selectedUtxos[i])
        ) {
          if (addressType === 2) {
            psbtTx.addInput({
              hash: feeUtxos.selectedUtxos[i].txId,
              index: feeUtxos.selectedUtxos[i].outputIndex,
              witnessUtxo: {
                value: feeUtxos.selectedUtxos[i].satoshis,
                script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
              },
              redeemScript: redeemScript,
            })
          } else {
            psbtTx.addInput({
              hash: feeUtxos.selectedUtxos[i].txId,
              index: feeUtxos.selectedUtxos[i].outputIndex,
              witnessUtxo: {
                value: feeUtxos.selectedUtxos[i].satoshis,
                script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
              },
            })
          }
        } else {
          return
        }
      }
      psbtTx.addOutput({
        address: payFeesWithSegwit ? segwitAddress : taprootAddress,
        value: Math.floor(feeUtxos.change),
      })
    } else {
      let amountForFee: number = fee
      if (inscription['isInscription']) {
        amountForFee = 2 * fee + 546
      }
      const feeUtxos = payFeesWithSegwit
        ? findUtxosForFees(nonMetaSegwitUtxos, fee)
        : findUtxosForFees(nonMetaTaprootUtxos, fee)
      if (!feeUtxos) {
        return await addTaprootFeeUtxo({
          taprootUtxos: taprootUtxos,
          feeRate: feeRate,
          psbtTx: psbtTx,
          taprootAddress: taprootAddress,
          utxosToSend: utxosToSend,
        })
      }
      for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
        if (
          usableUtxo(feeUtxos.selectedUtxos[i], utxosToSend?.selectedUtxos) &&
          confirmedUtxo(feeUtxos.selectedUtxos[i])
        ) {
          if (addressType === 2) {
            psbtTx.addInput({
              hash: feeUtxos.selectedUtxos[i].txId,
              index: feeUtxos.selectedUtxos[i].outputIndex,
              witnessUtxo: {
                value: feeUtxos.selectedUtxos[i].satoshis,
                script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
              },
              redeemScript: redeemScript,
            })
          } else {
            psbtTx.addInput({
              hash: feeUtxos.selectedUtxos[i].txId,
              index: feeUtxos.selectedUtxos[i].outputIndex,
              witnessUtxo: {
                value: feeUtxos.selectedUtxos[i].satoshis,
                script: Buffer.from(feeUtxos.selectedUtxos[i].scriptPk, 'hex'),
              },
            })
          }
        }
      }

      psbtTx.addOutput({
        address: payFeesWithSegwit ? segwitAddress : taprootAddress,
        value: Math.floor(feeUtxos.change),
      })

      psbtTx.addOutput({
        address: inscription['inscriberAddress'],
        value: Math.floor(fee),
      })
    }
  } catch (e) {
    console.error(e)
  }
}

const addTaprootFeeUtxo = async ({
  taprootUtxos,
  feeRate,
  psbtTx,
  taprootAddress,
  utxosToSend,
}: {
  taprootUtxos: Utxo[]
  feeRate: number
  psbtTx: bitcoin.Psbt
  taprootAddress: string
  utxosToSend?: { selectedUtxos: Utxo[]; totalSatoshis: number; change: number }
}) => {
  try {
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

    for (let i = 0; i < feeUtxos.selectedUtxos.length; i++) {
      if (
        usableUtxo(feeUtxos.selectedUtxos[i], utxosToSend.selectedUtxos) &&
        confirmedUtxo(feeUtxos.selectedUtxos[i])
      ) {
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
  } catch (error) {
    throw new Error('No available UTXOs to pay for fees')
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
      (inscription) => inscription.collectibles.id === inscriptionId
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
  return matchedUtxo
}

export function findUtxosForFees(utxos: Utxo[], amount: number) {
  let totalSatoshis = 0
  const selectedUtxos: Utxo[] = []

  for (const utxo of utxos) {
    if (totalSatoshis >= amount) break
    if (utxo.confirmations <= 0) continue

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

const usableUtxo = (feeUtxo: Utxo, utxosToSend: Utxo[]) => {
  if (!utxosToSend) {
    return true
  }
  for (let j = 0; j < utxosToSend.length; j++) {
    if (feeUtxo.txId === utxosToSend[j].txId) return false
  }
  return true
}

const confirmedUtxo = (feeUtxo: Utxo) => {
  return feeUtxo.confirmations > 0
}
