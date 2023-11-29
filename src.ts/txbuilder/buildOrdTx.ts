import * as bitcoin from 'bitcoinjs-lib'
import { PSBTTransaction } from './PSBTTransaction'
import { createP2PKHRedeemScript } from '../shared/utils'
import { getAddressType } from '../transactions'

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
}: {
  payFeesWithSegwit: boolean
  psbtTx: PSBTTransaction | bitcoin.Psbt
  feeRate: number
  taprootUtxos: any[]
  taprootAddress: string
  segwitUtxos?: any[]
  segwitAddress?: string
  segwitPubKey?: string
}) => {
  if (payFeesWithSegwit && segwitUtxos) {
    await addSegwitFeeUtxo({
      segwitUtxos: segwitUtxos,
      feeRate: feeRate,
      psbtTx: psbtTx,
      segwitAddress: segwitAddress,
      segwitPubKey: segwitPubKey,
    })
  } else {
    await addTaprootFeeUtxo({
      taprootUtxos: taprootUtxos,
      feeRate: feeRate,
      psbtTx: psbtTx,
      taprootAddress: taprootAddress,
    })
  }
  return
}

const addSegwitFeeUtxo = async ({
  segwitUtxos,
  feeRate,
  psbtTx,
  segwitAddress,
  segwitPubKey,
}: {
  segwitUtxos: any[]
  feeRate: number
  psbtTx: PSBTTransaction | bitcoin.Psbt
  segwitAddress: string
  segwitPubKey: string
}) => {
  try {
    const isBitcoinJSLib = psbtTx instanceof bitcoin.Psbt

    const { nonMetaSegwitUtxos } = segwitUtxos.reduce(
      (acc, utxo) => {
        utxo.inscriptions.length > 0
          ? acc.metaUtxos.push(utxo)
          : acc.nonMetaSegwitUtxos.push(utxo)
        return acc
      },
      { metaUtxos: [], nonMetaSegwitUtxos: [] }
    )

    nonMetaSegwitUtxos.sort((a, b) => a.satoshis - b.satoshis)

    const inputCount = isBitcoinJSLib
      ? psbtTx.txInputs.length === 0
        ? 1
        : psbtTx.txInputs.length
      : psbtTx.getNumberOfInputs() === 0
      ? 1
      : psbtTx.getNumberOfInputs()

    const vB = inputCount * 1 * 149 + 3 * 32 + 12
    const fee = vB * feeRate

    const feeUtxo = nonMetaSegwitUtxos.find((utxo) => {
      return utxo.satoshis - fee > 0 ? utxo : undefined
    })

    if (!feeUtxo) {
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
      console.log('entered', addressType)
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

        console.log({ redeemScript })
      } catch (error) {
        console.log(error)
      }
    }

    if (isBitcoinJSLib) {
      psbtTx.addInput({
        hash: feeUtxo.txId,
        index: 1,
        witnessUtxo: {
          value: feeUtxo.satoshis,
          script: Buffer.from(feeUtxo.scriptPk, 'hex'),
        },
        redeemScript: redeemScript,
      })
      psbtTx.addOutput({
        address: segwitAddress,
        value: feeUtxo.satoshis - fee,
      })
    } else {
      psbtTx.addInput(feeUtxo, true)
      psbtTx.addOutput(segwitAddress, feeUtxo.satoshis - fee)
    }
    return
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
}: {
  taprootUtxos: any[]
  feeRate: number
  psbtTx: PSBTTransaction | bitcoin.Psbt | any
  taprootAddress: string
}) => {
  const { nonMetaTaprootUtxos } = taprootUtxos.reduce(
    (acc, utxo) => {
      utxo.inscriptions.length > 0
        ? acc.metaUtxos.push(utxo)
        : acc.nonMetaTaprootUtxos.push(utxo)
      return acc
    },
    { metaUtxos: [], nonMetaTaprootUtxos: [] }
  )

  nonMetaTaprootUtxos.sort((a, b) => a.satoshis - b.satoshis)
  const vB = psbtTx.getNumberOfInputs() * 149 + 3 * 32 + 12
  const fee = vB * feeRate
  const feeUtxo = nonMetaTaprootUtxos.find((utxo) => {
    return utxo.satoshis - fee > 0 ? utxo : undefined
  })

  if (!feeUtxo) {
    throw new Error('No available UTXOs')
  }

  psbtTx.addInput(feeUtxo)
  psbtTx.addOutput(taprootAddress, feeUtxo.satoshis - fee)
  return
}

const addInscriptionUtxo = async ({
  metaUtxos,
  inscriptionId,
  toAddress,
  psbtTx,
}: {
  metaUtxos: any[]
  inscriptionId: string
  toAddress: string
  psbtTx: PSBTTransaction | bitcoin.Psbt | any
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
  psbtTx.addInput(matchedUtxo)
  psbtTx.addOutput(toAddress, matchedUtxo.satoshis)
  return
}

/// Use as ref for getting all needed utxos to cover

// for await (let utxo of utxosGathered) {
//   const {
//     tx_hash_big_endian,
//     tx_output_n,
//     value,
//     script: outputScript,
//   } = utxo

//   psbt.addInput({
//     hash: tx_hash_big_endian,
//     index: tx_output_n,
//     witnessUtxo: { value, script: Buffer.from(outputScript, 'hex') },
//   })
// }

// function createP2PKHRedeemScript(publicKeyHex) {
//   const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex')
//   const publicKeyHash = bitcoin.crypto.hash160(publicKeyBuffer)
//
//   return bitcoin.script.compile([
//     bitcoin.opcodes.OP_DUP,
//     bitcoin.opcodes.OP_HASH160,
//     publicKeyHash,
//     bitcoin.opcodes.OP_EQUALVERIFY,
//     bitcoin.opcodes.OP_CHECKSIG,
//   ])
// }
