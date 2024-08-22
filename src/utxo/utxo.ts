import * as bitcoin from 'bitcoinjs-lib'
import { Provider } from '../provider'
import { Account, SpendStrategy } from '../account'
import { UTXO_DUST } from '../shared/constants'
import { FormattedUtxo } from 'shared/interface'

export interface EsploraUtxo {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
  value: number
}

export const availableBalance = async ({
  account,
  provider,
}: {
  account: Account
  provider: Provider
}) => {
  let balance: number = 0
  let pendingBalance: number = 0

  for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
    const address = account[account.spendStrategy.addressOrder[i]].address

    const { spendableTotalAmount, pendingTotalAmount } = await addressUtxos({
      address,
      provider,
      spendStrategy: account.spendStrategy,
    })
    balance += spendableTotalAmount
    pendingBalance += pendingTotalAmount
  }
  return { balance, pendingBalance }
}
export const addressUtxos = async ({
  address,
  provider,
  spendStrategy,
}: {
  address: string
  provider: Provider
  spendStrategy?: SpendStrategy
}) => {
  let spendableTotalAmount: number = 0
  let pendingTotalAmount: number = 0
  const spendableUtxos: FormattedUtxo[] = []
  const pendingUtxos: FormattedUtxo[] = []
  const ordUtxos: FormattedUtxo[] = []
  const runeUtxos: FormattedUtxo[] = []

  let multiCall = await provider.sandshrew.multiCall([
    ['esplora_address::utxo', [address]],
    ['btc_getblockcount', []],
  ])

  let blockCount = multiCall[1].result
  let utxos = multiCall[0].result
  if (utxos.length === 0) {
    return {
      spendableTotalAmount,
      spendableUtxos,
      runeUtxos,
      ordUtxos,
      pendingUtxos,
      pendingTotalAmount,
    }
  }

  const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast ?? true

  utxos = utxos
    .filter((utxo) => utxo.value >= UTXO_DUST)
    .sort((a, b) =>
      utxoSortGreatestToLeast ? b.value - a.value : a.value - b.value
    )

  const utxoPromises = utxos.map(async (utxo) => {
    const outputId = `${utxo.txid}:${utxo.vout}`
    const [hasInscription, hasRune] = await Promise.all([
      provider.ord.getTxOutput(outputId),
      provider.network.bech32 !== bitcoin.networks.regtest.bech32
        ? provider.api.getOutputRune({ output: outputId })
        : Promise.resolve(false),
    ])

    return { utxo, hasInscription, hasRune }
  })

  const results = await Promise.all(utxoPromises)

  for (const { utxo, hasInscription, hasRune } of results) {
    if (
      hasInscription.inscriptions.length === 0 &&
      hasInscription.runes.length === 0 &&
      hasInscription.indexed &&
      hasInscription.value !== 546 &&
      !hasRune?.output
    ) {
      const transactionDetails = await provider.esplora.getTxInfo(utxo.txid)
      const voutEntry = transactionDetails.vout.find(
        (v) => v.scriptpubkey_address === address
      )

      spendableUtxos.push({
        txId: utxo.txid,
        outputIndex: utxo.vout,
        satoshis: utxo.value,
        confirmations: utxo.status.confirmed
          ? blockCount - utxo.status.block_height
          : 0,
        scriptPk: voutEntry.scriptpubkey,
        address: address,
        inscriptions: [],
      })

      spendableTotalAmount += utxo.value
    }

    if (hasRune?.output || hasInscription.runes.length > 0) {
      const transactionDetails = await provider.esplora.getTxInfo(utxo.txid)
      const voutEntry = transactionDetails.vout.find(
        (v) => v.scriptpubkey_address === address
      )
      runeUtxos.push({
        txId: utxo.txid,
        outputIndex: utxo.vout,
        satoshis: utxo.value,
        confirmations: utxo.status.confirmed
          ? blockCount - utxo.status.block_height
          : 0,
        scriptPk: voutEntry.scriptpubkey,
        address: address,
        inscriptions: [],
      })
    }

    if (
      hasInscription.indexed &&
      hasInscription.inscriptions.length > 0 &&
      !hasRune?.output
    ) {
      const transactionDetails = await provider.esplora.getTxInfo(utxo.txid)
      const voutEntry = transactionDetails.vout.find(
        (v) => v.scriptpubkey_address === address
      )
      ordUtxos.push({
        txId: utxo.txid,
        outputIndex: utxo.vout,
        satoshis: utxo.value,
        confirmations: utxo.status.confirmed
          ? blockCount - utxo.status.block_height
          : 0,
        scriptPk: voutEntry.scriptpubkey,
        address: address,
        inscriptions: hasInscription.inscriptions,
      })
    }

    if (!hasInscription.indexed && !utxo.status.confirmed) {
      const transactionDetails = await provider.esplora.getTxInfo(utxo.txid)
      const voutEntry = transactionDetails.vout.find(
        (v) => v.scriptpubkey_address === address
      )
      pendingUtxos.push({
        txId: utxo.txid,
        outputIndex: utxo.vout,
        satoshis: utxo.value,
        confirmations: utxo.status.confirmed
          ? blockCount - utxo.status.block_height
          : 0,
        scriptPk: voutEntry.scriptpubkey,
        address: address,
        inscriptions: [],
      })
      pendingTotalAmount += utxo.value
    }
  }

  return {
    spendableTotalAmount,
    spendableUtxos,
    runeUtxos,
    ordUtxos,
    pendingUtxos,
    pendingTotalAmount,
  }
}

export const accountUtxos = async ({
  account,
  provider,
}: {
  account: Account
  provider: Provider
}) => {
  let spendableTotalAmount: number = 0
  let pendingTotalAmount: number = 0
  const accounts = []

  for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
    const address = account[account.spendStrategy.addressOrder[i]].address
    const addressType = account.spendStrategy.addressOrder[i]
    const {
      spendableTotalAmount: spendTotal,
      spendableUtxos: spendUtxos,
      runeUtxos: rune,
      ordUtxos: ord,
      pendingUtxos: pending,
      pendingTotalAmount: pendingTotal,
    } = await addressUtxos({
      address,
      provider,
      spendStrategy: account.spendStrategy,
    })

    spendableTotalAmount += spendTotal
    pendingTotalAmount += pendingTotal

    accounts.push({
      [addressType]: {
        spendTotal,
        spendUtxos,
        rune,
        ord,
        pending,
        pendingTotal,
      },
    })
  }
  return { spendableTotalAmount, pendingTotalAmount, accounts }
}
