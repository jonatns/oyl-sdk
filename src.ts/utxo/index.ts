//spend strategy and utxo strategy

import * as bitcoin from 'bitcoinjs-lib'
import { Provider } from '../provider/provider'
import { getAddressType } from '../transactions'
import { Utxo } from '../txbuilder'
import { Account } from '../account'

export const spendableUtxos = async (
  address: string,
  provider: Provider,
  spendAmount: number
) => {
  const addressType = getAddressType(address)
  const utxosResponse: any[] = await provider.esplora.getAddressUtxo(address)
  if (!utxosResponse || utxosResponse?.length === 0) {
    return []
  }
  const formattedUtxos: Utxo[] = []
  let filtered = utxosResponse

  for (const utxo of filtered) {
    const hasInscription = await provider.ord.getTxOutput(
      utxo.txid + ':' + utxo.vout
    )
    let hasRune: any = false
    if (provider.network != bitcoin.networks.regtest) {
      hasRune = await provider.api.getOutputRune({
        output: utxo.txid + ':' + utxo.vout,
      })
    }
    if (
      hasInscription.inscriptions.length === 0 &&
      hasInscription.runes.length === 0 &&
      hasInscription.value !== 546 &&
      !hasRune?.output
    ) {
      const transactionDetails = await provider.esplora.getTxInfo(utxo.txid)
      const voutEntry = transactionDetails.vout.find(
        (v) => v.scriptpubkey_address === address
      )
      if (utxo.status.confirmed) {
        formattedUtxos.push({
          txId: utxo.txid,
          outputIndex: utxo.vout,
          satoshis: utxo.value,
          confirmations: utxo.status.confirmed ? 3 : 0,
          scriptPk: voutEntry.scriptpubkey,
          address: address,
          inscriptions: [],
        })
      }
    }
  }
  if (formattedUtxos.length === 0) {
    return undefined
  }
  const sortedUtxos = formattedUtxos.sort((a, b) => b.satoshis - a.satoshis)

  return sortedUtxos
}

export const oylSpendableUtxos = async ({
  accounts,
  provider,
  spendAmount,
}: {
  accounts: Account
  provider: Provider
  spendAmount: number
}) => {
  let totalGathered: number = 0
  let allUtxos: Utxo[] = []
  for (let i = 0; i < accounts.spendStrategy.addressOrder.length; i++) {
    const address = accounts[accounts.spendStrategy.addressOrder[i]].address
    const utxos = await provider.esplora.getAddressUtxo(address)
    const gatheredUtxos = await gatherSpendAmountOfSatoshis({
      provider,
      address: address,
      utxos,
      spendAmount,
    })
    totalGathered += gatheredUtxos.totalGathered
    allUtxos = [...allUtxos, ...gatheredUtxos.formattedUtxos]
    if (gatheredUtxos.totalGathered >= spendAmount) {
      if (accounts.spendStrategy.utxoSortGreatestToLeast) {
        allUtxos = allUtxos.sort((a, b) => b.satoshis - a.satoshis)
      }
      if (!accounts.spendStrategy.utxoSortGreatestToLeast) {
        allUtxos = allUtxos.sort((a, b) => a.satoshis - b.satoshis)
      }
      return allUtxos
    }
  }
  throw Error('Insuffiecient balance')
}

const gatherSpendAmountOfSatoshis = async ({
  spendAmount,
  provider,
  utxos,
  address,
}: {
  spendAmount: number
  provider: Provider
  utxos: any[]
  address: string
}) => {
  const formattedUtxos: Utxo[] = []
  let totalGathered: number = 0
  for (let i = 0; i < utxos.length; i++) {
    if (totalGathered >= spendAmount) {
      return { totalGathered: totalGathered, formattedUtxos: formattedUtxos }
    }
    const hasInscription = await provider.ord.getTxOutput(
      utxos[i].txid + ':' + utxos[i].vout
    )
    let hasRune: any = false
    if (provider.network != bitcoin.networks.regtest) {
      hasRune = await provider.api.getOutputRune({
        output: utxos[i].txid + ':' + utxos[i].vout,
      })
    }
    if (
      hasInscription.inscriptions.length === 0 &&
      hasInscription.runes.length === 0 &&
      hasInscription.value !== 546 &&
      !hasRune?.output
    ) {
      const transactionDetails = await provider.esplora.getTxInfo(utxos[i].txid)

      const voutEntry = transactionDetails.vout.find(
        (v) => v.scriptpubkey_address === address
      )
      if (utxos[i].status.confirmed) {
        formattedUtxos.push({
          txId: utxos[i].txid,
          outputIndex: utxos[i].vout,
          satoshis: utxos[i].value,
          confirmations: utxos[i].status.confirmed ? 3 : 0,
          scriptPk: voutEntry.scriptpubkey,
          address: address,
          inscriptions: [],
        })
        totalGathered += utxos[i].value
      }
    }
  }
  return { totalGathered: totalGathered, formattedUtxos: formattedUtxos }
}

export function findUtxosToCoverAmount(utxos: any[], amount: number) {
  if (!utxos || utxos?.length === 0) {
    return undefined
  }
  let totalSatoshis = 0
  const selectedUtxos: any[] = []

  for (const utxo of utxos) {
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
    return undefined
  }
}
