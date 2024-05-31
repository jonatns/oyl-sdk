//spend strategy and utxo strategy

import * as bitcoin from 'bitcoinjs-lib'
import { Provider } from '../provider/provider'
import { getAddressType } from '../transactions'
import { Utxo } from '../txbuilder'
import { Account, SpendStrategy } from '../account'
import { UTXO_DUST } from '../shared/constants'

export interface EsploraUtxo {
  txid: string
  vout: number
  status: {
    confirmed: boolean,
    block_height: number,
    block_hash: string,
    block_time: number
  },
  value: number
}

export interface FormattedUtxo {
  txId: string
  outputIndex: number
  satoshis: number
  scriptPk: string
  address: string
  inscriptions: any[]
  confirmations: number
}


export const accountSpendableUtxos = async ({
  account,
  provider,
  spendAmount,
}: {
  account: Account
  provider: Provider
  spendAmount: number
}) => {
  let totalAmount: number = 0
  let allUtxos: FormattedUtxo[] = []
  for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
    const address = account[account.spendStrategy.addressOrder[i]].address

    const { totalGathered, utxos: formattedUtxos } = await addressSpendableUtxos({
      address,
      provider,
      spendAmount,
      spendStrategy: account.spendStrategy
    })
    totalAmount += totalGathered
    allUtxos = [...allUtxos, ...formattedUtxos]
    if (totalAmount >= spendAmount) {
      return allUtxos
    }
  }
  throw Error('Insufficient balance')
}


export const addressSpendableUtxos = async ({
  address,
  provider,
  spendAmount,
  spendStrategy
}: {
  address: string
  provider: Provider
  spendAmount?: number
  spendStrategy?: SpendStrategy
}) => {
  let totalGathered: number = 0
  let sortedUtxos: EsploraUtxo[] = []
  const formattedUtxos: FormattedUtxo[] = []

  const utxos: EsploraUtxo[] = await provider.esplora.getAddressUtxo(address)

  const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast !== undefined
  ? spendStrategy.utxoSortGreatestToLeast
  : true

  if (utxoSortGreatestToLeast) {
    sortedUtxos = utxos.sort((a, b) => b.value - a.value)
  } else {
    sortedUtxos = utxos.sort((a, b) => a.value - b.value)
  }

  let filteredUtxos: EsploraUtxo[] = sortedUtxos.filter((utxo) => {
    return (
      utxo.value > UTXO_DUST && 
      utxo.value != 546 &&
      utxo.status.confirmed === true
    )
  });

  for (let i = 0; i < filteredUtxos.length; i++) {
    if (spendAmount && totalGathered >= spendAmount) {
      return { totalGathered, utxos: formattedUtxos }
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

  return { totalGathered, utxos: formattedUtxos }
}


export function findUtxosToCoverAmount(utxos: FormattedUtxo[], amount: number) {
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
