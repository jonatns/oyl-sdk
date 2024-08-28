import * as bitcoin from 'bitcoinjs-lib'
import { Provider } from '../provider'
import { Account, SpendStrategy } from '../account'
import { UTXO_DUST } from '../shared/constants'

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

export const availableBalance = async ({
  account,
  provider,
}: {
  account: Account
  provider: Provider
}) => {
  let totalAmount: number = 0
  for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
    const address = account[account.spendStrategy.addressOrder[i]].address

    const { totalAmount: addressTotal } = await addressSpendableUtxos({
      address,
      provider,
      spendStrategy: account.spendStrategy,
    })
    totalAmount += addressTotal
  }
  return { balance: totalAmount }
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

export const accountBalance = async ({
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

    const { spendableTotalBalance, pendingTotalBalance } = await addressUtxos({
      address,
      provider,
      spendStrategy: account.spendStrategy,
    })
    balance += spendableTotalBalance
    pendingBalance += pendingTotalBalance
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
  let spendableTotalBalance: number = 0
  let pendingTotalBalance: number = 0
  let totalBalance: number = 0
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

      spendableTotalBalance += utxo.value
      totalBalance += utxo.value
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
      totalBalance += utxo.value
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
      totalBalance += utxo.value
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
      pendingTotalBalance += utxo.value
      totalBalance += utxo.value
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
  let accountSpendableTotalBalance: number = 0
  let accountPendingTotalBalance: number = 0
  let accountTotalBalance: number = 0
  const accounts = []

  for (let i = 0; i < account.spendStrategy.addressOrder.length; i++) {
    const address = account[account.spendStrategy.addressOrder[i]].address
    const addressType = account.spendStrategy.addressOrder[i]
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
      spendStrategy: account.spendStrategy,
    })

    accountSpendableTotalBalance += spendableTotalBalance
    accountPendingTotalBalance += pendingTotalBalance
    accountTotalBalance += totalBalance

    accounts.push({
      [addressType]: {
        spendableTotalBalance,
        spendableUtxos,
        runeUtxos,
        ordUtxos,
        pendingUtxos,
        pendingTotalBalance,
        totalBalance,
      },
    })
  }
  return {
    accountTotalBalance,
    accountSpendableTotalBalance,
    accountPendingTotalBalance,
    accounts,
  }
}
