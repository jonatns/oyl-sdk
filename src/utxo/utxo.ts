import * as bitcoin from 'bitcoinjs-lib'
import { Provider } from '../provider'
import { Account, SpendStrategy } from '../account'
import { UTXO_DUST } from '../shared/constants'
import asyncPool from 'tiny-async-pool'

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

export interface FormattedUtxo {
  txId: string
  outputIndex: number
  satoshis: number
  scriptPk: string
  address: string
  inscriptions: any[]
  confirmations: number
}

export interface AddressPortfolio {
  spendableTotalBalance: number
  spendableUtxos: FormattedUtxo[]
  runeUtxos: FormattedUtxo[]
  ordUtxos: FormattedUtxo[]
  pendingUtxos: FormattedUtxo[]
  pendingTotalBalance: number
  totalBalance: number
}

export const accountBalance = async ({
  account,
  provider,
}: {
  account: Account
  provider: Provider
}) => {
  let confirmedAmount: number = 0
  let pendingAmount: number = 0
  let amount: number = 0

  for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
    const address = account[account.spendStrategy.addressOrder[i]].address
    const { chain_stats, mempool_stats } = await provider.esplora._call(
      'esplora_address',
      [address]
    )

    const btcBalance = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum
    const pendingBtcBalance =
      mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum

    confirmedAmount += btcBalance
    pendingAmount += pendingBtcBalance
    amount += btcBalance + pendingAmount
  }
  return {
    confirmedAmount: confirmedAmount / 10 ** 8,
    pendingAmount: pendingAmount / 10 ** 8,
    amount: amount / 10 ** 8,
  }
}

export const addressBalance = async ({
  address,
  provider,
}: {
  address: string
  provider: Provider
}) => {
  let confirmedAmount: number = 0
  let pendingAmount: number = 0
  let amount: number = 0

  const { chain_stats, mempool_stats } = await provider.esplora._call(
    'esplora_address',
    [address]
  )

  const btcBalance = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum
  const pendingBtcBalance =
    mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum

  confirmedAmount += btcBalance
  pendingAmount += pendingBtcBalance
  amount += btcBalance + pendingAmount

  return {
    confirmedAmount: confirmedAmount / 10 ** 8,
    pendingAmount: pendingAmount / 10 ** 8,
    amount: amount / 10 ** 8,
  }
}

export const addressSpendableUtxos = async ({
  address,
  provider,
  spendAmount,
  spendStrategy,
}: {
  address: string
  provider: Provider
  spendAmount?: number
  spendStrategy?: SpendStrategy
}) => {
  let totalAmount = 0
  const formattedUtxos: FormattedUtxo[] = []

  let utxos = await provider.esplora.getAddressUtxo(address)

  if (utxos.length === 0) {
    return { totalAmount, utxos: formattedUtxos }
  }

  const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast ?? true

  utxos = utxos
    .filter((utxo) => utxo.value > UTXO_DUST && utxo.value !== 546)
    .sort((a, b) =>
      utxoSortGreatestToLeast ? b.value - a.value : a.value - b.value
    )

  const utxoPromises = utxos.map(async (utxo) => {
    const outputId = `${utxo.txid}:${utxo.vout}`

    const [hasInscription, hasRune] = await Promise.all([
      provider.ord.getTxOutput(outputId),
      provider.network !== bitcoin.networks.regtest
        ? provider.api.getOutputRune({ output: outputId })
        : Promise.resolve(false),
    ])

    return { utxo, hasInscription, hasRune }
  })

  const results = await Promise.all(utxoPromises)

  for (const { utxo, hasInscription, hasRune } of results) {
    if (
      (spendAmount && totalAmount >= spendAmount) ||
      hasInscription.inscriptions.length > 0 ||
      hasInscription.runes.length > 0 ||
      !hasInscription.indexed ||
      hasInscription.value === 546 ||
      hasRune?.output
    ) {
      continue
    }

    const transactionDetails = await provider.esplora.getTxInfo(utxo.txid)
    const voutEntry = transactionDetails.vout.find(
      (v) => v.scriptpubkey_address === address
    )

    formattedUtxos.push({
      txId: utxo.txid,
      outputIndex: utxo.vout,
      satoshis: utxo.value,
      confirmations: utxo.status.confirmed ? 3 : 0,
      scriptPk: voutEntry.scriptpubkey,
      address: address,
      inscriptions: [],
    })

    totalAmount += utxo.value

    if (spendAmount && totalAmount >= spendAmount) {
      break
    }
  }

  return { totalAmount, utxos: formattedUtxos }
}

export const accountSpendableUtxos = async ({
  account,
  provider,
  spendAmount,
}: {
  account: Account
  provider: Provider
  spendAmount?: number
}) => {
  let totalAmount: number = 0
  let allUtxos: FormattedUtxo[] = []
  let remainingSpendAmount = spendAmount
  for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
    const address = account[account.spendStrategy.addressOrder[i]].address

    const { totalAmount: addressTotal, utxos: formattedUtxos } =
      await addressSpendableUtxos({
        address,
        provider,
        spendAmount: remainingSpendAmount,
        spendStrategy: account.spendStrategy,
      })
    totalAmount += addressTotal
    allUtxos = [...allUtxos, ...formattedUtxos]
    if (spendAmount && totalAmount >= spendAmount) {
      return { totalAmount, utxos: allUtxos }
    }
    remainingSpendAmount -= addressTotal
  }
  return { totalAmount, utxos: allUtxos }
}

export const addressUtxos = async ({
  address,
  provider,
  spendStrategy,
}: {
  address: string
  provider: Provider
  spendStrategy?: SpendStrategy
}): Promise<AddressPortfolio> => {
  let spendableTotalBalance: number = 0
  let pendingTotalBalance: number = 0
  let totalBalance: number = 0
  const spendableUtxos: FormattedUtxo[] = []
  const pendingUtxos: FormattedUtxo[] = []
  const ordUtxos: FormattedUtxo[] = []
  const runeUtxos: FormattedUtxo[] = []

  const multiCall = await provider.sandshrew.multiCall([
    ['esplora_address::utxo', [address]],
    ['btc_getblockcount', []],
  ])

  const blockCount = multiCall[1].result
  let utxos = multiCall[0].result
  if (utxos.length === 0) {
    return {
      spendableTotalBalance,
      spendableUtxos,
      runeUtxos,
      ordUtxos,
      pendingUtxos,
      pendingTotalBalance,
      totalBalance,
    }
  }

  const utxoSortGreatestToLeast = spendStrategy?.utxoSortGreatestToLeast ?? true
  utxos.sort((a, b) =>
    utxoSortGreatestToLeast ? b.value - a.value : a.value - b.value
  )

  const concurrencyLimit = 100
  const results = []

  const iteratorFn = async (utxo) => {
    try {
      const txIdVout = `${utxo.txid}:${utxo.vout}`
      const [txOutput, txDetails] = await Promise.all([
        provider.ord.getTxOutput(txIdVout),
        provider.esplora.getTxInfo(utxo.txid),
      ])

      // Change the UTXO script_pubkey from ASM to hex.
      // We might be able to derive this without making an extra call.
      utxo.script_pubkey = txDetails.vout[utxo.vout].scriptpubkey

      return { utxo, txOutput }
    } catch (error) {
      console.error(`Error processing UTXO ${utxo.txid}:${utxo.vout}`, error)
      return null
    }
  }

  for await (const result of asyncPool(concurrencyLimit, utxos, iteratorFn)) {
    if (result !== null) {
      results.push(result)
    }
  }

  for (const { utxo, txOutput } of results) {
    totalBalance += utxo.value

    if (txOutput.indexed) {
      const hasInscriptions = txOutput.inscriptions.length > 0
      const hasRunes = Object.keys(txOutput.runes).length > 0
      const confirmations = blockCount - utxo.status.block_height

      if (!hasInscriptions && !hasRunes) {
        spendableUtxos.push({
          txId: utxo.txid,
          outputIndex: utxo.vout,
          satoshis: utxo.value,
          scriptPk: utxo.script_pubkey,
          address: address,
          inscriptions: [],
          confirmations,
        })

        spendableTotalBalance += utxo.value
      }

      if (hasRunes) {
        runeUtxos.push({
          txId: utxo.txid,
          outputIndex: utxo.vout,
          satoshis: utxo.value,
          scriptPk: utxo.script_pubkey,
          address: address,
          inscriptions: [],
          confirmations,
        })
      }

      if (hasInscriptions) {
        ordUtxos.push({
          txId: utxo.txid,
          outputIndex: utxo.vout,
          satoshis: utxo.value,
          scriptPk: utxo.script_pubkey,
          address: address,
          inscriptions: txOutput.inscriptions,
          confirmations,
        })
      }
    } else if (!utxo.status.confirmed) {
      pendingUtxos.push({
        txId: utxo.txid,
        outputIndex: utxo.vout,
        satoshis: utxo.value,
        scriptPk: utxo.script_pubkey,
        address: address,
        inscriptions: [],
        confirmations: 0,
      })

      pendingTotalBalance += utxo.value
    }
  }

  return {
    spendableTotalBalance,
    spendableUtxos,
    runeUtxos,
    ordUtxos,
    pendingUtxos,
    pendingTotalBalance,
    totalBalance,
  }
}

export const accountUtxos = async ({
  account,
  provider,
}: {
  account: Account
  provider: Provider
}) => {
  let accountSpendableTotalBalance = 0
  let accountPendingTotalBalance = 0
  let accountTotalBalance = 0
  const accounts = {}

  const addresses = [
    { addressType: 'nativeSegwit', address: account.nativeSegwit.address },
    { addressType: 'nestedSegwit', address: account.nestedSegwit.address },
    { addressType: 'taproot', address: account.taproot.address },
    { addressType: 'legacy', address: account.legacy.address },
  ]

  const utxoPromises = addresses.map(async ({ address, addressType }) => {
    const {
      spendableTotalBalance,
      spendableUtxos,
      runeUtxos,
      ordUtxos,
      pendingUtxos,
      pendingTotalBalance,
      totalBalance,
    } = await addressUtxos({
      address,
      provider,
    })

    accountSpendableTotalBalance += spendableTotalBalance
    accountPendingTotalBalance += pendingTotalBalance
    accountTotalBalance += totalBalance

    accounts[addressType] = {
      spendableTotalBalance,
      spendableUtxos,
      runeUtxos,
      ordUtxos,
      pendingUtxos,
      pendingTotalBalance,
      totalBalance,
    }
  })

  await Promise.all(utxoPromises)

  return {
    accountTotalBalance,
    accountSpendableTotalBalance,
    accountPendingTotalBalance,
    accounts,
  }
}
