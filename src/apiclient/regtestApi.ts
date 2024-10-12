import * as bitcoin from 'bitcoinjs-lib'
import { Provider } from '..'

export const getAllInscriptionsByAddressRegtest = async (address: string) => {
  const oyl = new Provider({
    url: 'http://localhost:3000',
    version: 'v2',
    projectId: 'regtest',
    network: bitcoin.networks.regtest,
    networkType: 'mainnet',
    apiUrl: 'https://staging-api.oyl.gg',
  })
  const utxosResponse = await oyl.esplora.getAddressUtxo(address)
  const data = []

  const inscriptionUtxos = utxosResponse.filter((utxo) => utxo.value == 546)

  for (const utxo of inscriptionUtxos) {
    if (utxo.txid) {
      const transactionDetails = await oyl.ord.getTxOutput(
        utxo.txid + ':' + utxo.vout
      )
      const {
        inscription_id,
        inscription_number,
        satpoint,
        content_type,
        address,
      } = await oyl.ord.getInscriptionById(transactionDetails.inscriptions[0])
      if (inscription_id) {
        data.push({
          inscription_id,
          inscription_number,
          satpoint,
          mime_type: content_type,
          owner_wallet_addr: address,
        })
      }
    }
  }

  return {
    statusCode: 200,
    data,
  }
}

export const getRuneOutpointsRegtest = async (address: string) => {
  const oyl = new Provider({
    url: 'http://localhost:3000',
    version: 'v2',
    projectId: 'regtest',
    network: bitcoin.networks.regtest,
    networkType: 'mainnet',
    apiUrl: 'https://staging-api.oyl.gg',
  })
  const allUtxos = await oyl.esplora.getAddressUtxo(address)
  const data = []

  for (const utxo of allUtxos) {
    if (utxo.txid) {
      const output = utxo.txid + ':' + utxo.vout
      const txDetails = await oyl.ord.getTxOutput(output)
      const runes = txDetails.runes ? Object.entries(txDetails.runes) : []

      for (const [runeName, runeInfo] of runes) {
        const { id } = await oyl.ord.getRuneByName(runeName)
        const runeAmount = runeInfo.amount
        const index = data.findIndex((rune) => rune.rune_name == runeName)
        if (index != -1) {
          // update balance
          data[index].total_balance += runeAmount
        } else {
          // create new record
          const txInfo = await oyl.esplora.getTxInfo(utxo.txid)
          data.push({
            pkscript: txInfo.vout[utxo.vout].scriptpubkey,
            wallet_addr: address,
            output,
            rune_ids: [id],
            balances: [runeAmount],
            rune_names: [runeName],
            spaced_rune_names: [runeName],
            decimals: [runeInfo.divisibility],
          })
        }
      }
    }
  }
  return {
    statusCode: 200,
    data,
  }
}

export const getRuneBalanceRegtest = async (address: string) => {
  const oyl = new Provider({
    url: 'http://localhost:3000',
    version: 'v2',
    projectId: 'regtest',
    network: bitcoin.networks.regtest,
    networkType: 'mainnet',
    apiUrl: 'https://staging-api.oyl.gg',
  })
  const allUtxos = await oyl.esplora.getAddressUtxo(address)
  const data = []

  for (const utxo of allUtxos) {
    if (utxo.txid) {
      const output = utxo.txid + ':' + utxo.vout
      const txDetails = await oyl.ord.getTxOutput(output)
      const runes = txDetails.runes ? Object.entries(txDetails.runes) : []

      if (runes.length > 0) {
        const [runeName, runeInfo] = runes[0]
        const { id } = await oyl.ord.getRuneByName(runeName)
        const runeAmount = runeInfo.amount
        const index = data.findIndex((rune) => rune.rune_name == runeName)
        if (index != -1) {
          // update balance
          data[index].total_balance += runeAmount
        } else {
          // create new record
          const txInfo = await oyl.esplora.getTxInfo(utxo.txid)
          data.push({
            pkscript: txInfo.vout[utxo.vout].scriptpubkey,
            wallet_addr: address,
            rune_id: id,
            total_balance: runeAmount,
            rune_name: runeName,
            spaced_rune_name: runeName,
            decimals: runeInfo.divisibility,
            avg_unit_price_in_sats: null,
          })
        }
      }
    }
  }
  return {
    statusCode: 200,
    data,
  }
}
