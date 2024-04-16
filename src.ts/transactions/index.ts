import fetch from 'node-fetch'
import * as bitcoin from 'bitcoinjs-lib'
import {
  AddressType,
  IBlockchainInfoUTXO,
  txOutputs,
} from '../shared/interface'
import { addressFormats } from '../wallet/accounts'

export const getBtcPrice = async () => {
  try {
    const response = await fetch(`https://blockchain.info/ticker`, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch btc price from binance`)
    }

    const jsonResponse = await response.json()

    return jsonResponse
  } catch (error) {
    console.log(error)
  }
}

export const calculateBalance = function (utxos): number {
  let balance = 0
  for (let utxo = 0; utxo < utxos.length; utxo++) {
    balance += utxos[utxo].value
  }
  return balance / 1e8 // Convert from satoshis to BTC
}

export const convertUsdValue = async (amount) => {
  const pricePayload = await getBtcPrice()
  const btcPrice = parseFloat(pricePayload.USD.last)
  const amountInBTC = parseFloat(amount) * btcPrice
  return amountInBTC.toFixed(2)
}

export const getMetaUtxos = async (
  address: string,
  utxos: IBlockchainInfoUTXO[],
  inscriptions: any
) => {
  const formattedData = []
  for (const utxo of utxos) {
    const formattedUtxo = {
      txId: utxo.tx_hash_big_endian,
      outputIndex: utxo.tx_output_n,
      satoshis: utxo.value,
      scriptPk: utxo.script,
      confirmations: utxo.confirmations,
      addressType: getAddressType(address),
      address: address,
      inscriptions: [],
    }

    for (const inscription of inscriptions['collectibles']) {
      if (
        inscription.detail.location.includes(utxo.tx_hash_big_endian) &&
        utxo.value === 546
      ) {
        formattedUtxo.inscriptions.push({ collectibles: inscription.detail })
      }
    }
    for (const inscription of inscriptions['brc20']) {
      if (
        inscription.detail.location.includes(utxo.tx_hash_big_endian) &&
        utxo.value === 546
      ) {
        formattedUtxo.inscriptions.push({ brc20: inscription.detail })
      }
    }

    for (const inscription of inscriptions['runes']) {
      if (
        inscription.txId === utxo.tx_hash_big_endian &&
        inscription.outputIndex == utxo.tx_output_n
      ) {
        formattedUtxo.inscriptions.push({ runes: inscription.detail })
      }
    }
    formattedData.push(formattedUtxo)
  }

  return formattedData
}

export function getAddressType(address: string): AddressType | null {
  if (
    addressFormats.mainnet.p2pkh.test(address) ||
    addressFormats.testnet.p2pkh.test(address) ||
    addressFormats.regtest.p2pkh.test(address)
  ) {
    return AddressType.P2PKH
  } else if (
    addressFormats.mainnet.p2tr.test(address) ||
    addressFormats.testnet.p2tr.test(address) ||
    addressFormats.regtest.p2tr.test(address)
  ) {
    return AddressType.P2TR
  } else if (
    addressFormats.mainnet.p2sh.test(address) ||
    addressFormats.testnet.p2sh.test(address) ||
    addressFormats.regtest.p2sh.test(address)
  ) {
    return AddressType.P2SH_P2WPKH
  } else if (
    addressFormats.mainnet.p2wpkh.test(address) ||
    addressFormats.testnet.p2wpkh.test(address) ||
    addressFormats.regtest.p2wpkh.test(address)
  ) {
    return AddressType.P2WPKH
  } else {
    return null
  }
}

export const validateTaprootAddress = ({ address, type }) => {
  try {
    const decodedBech32 = bitcoin.address.fromBech32(address)
    if (decodedBech32.version === 1 && decodedBech32.data.length === 32) {
      return type === 'taproot'
    }
  } catch (error) {
    // Address is not in Bech32 format
    return false
  }

  return false
}

export const validateSegwitAddress = ({ address, type }) => {
  try {
    const decodedBech32 = bitcoin.address.fromBech32(address)
    if (decodedBech32.version === 0) {
      return type === 'segwit'
    }
  } catch (error) {
    // Address is not in Bech32 format
    return false
  }

  return false
}

const Tag = {
  Body: 0,
  Flags: 2,
  Rune: 4,
  Premine: 6,
  Cap: 8,
  Amount: 10,
  HeightStart: 12,
  HeightEnd: 14,
  OffsetStart: 16,
  OffsetEnd: 18,
  Mint: 20,
  Pointer: 22,
  Cenotaph: 126,
  Divisibility: 1,
  Spacers: 3,
  Symbol: 5,
  Nop: 127,
}

function decodeVarint(buffer, startIndex = 0) {
  let result = BigInt(0)
  let shift = 0
  let position = startIndex
  let byte

  do {
    byte = buffer[position++]
    let byteVal = BigInt(byte & 0x7f)
    result |= byteVal << BigInt(shift)
    shift += 7
  } while (byte >= 128)

  return { value: result, nextIndex: position }
}

export const decodePayload = (payload) => {
  let index = 0
  const result: any = {}

  while (index < payload.length) {
    const { value: tag, nextIndex } = decodeVarint(payload, index)
    index = nextIndex

    switch (Number(tag)) {
      case Tag.Body:
        const edicts = []
        let id = { block: 0n, tx: 0n }
        while (index < payload.length) {
          const { value: blockDelta, nextIndex: blockNextIndex } = decodeVarint(
            payload,
            index
          )
          index = blockNextIndex
          if (blockDelta === 0n) {
            const { value: txDelta, nextIndex: txNextIndex } = decodeVarint(
              payload,
              index
            )
            index = txNextIndex
            id.tx += txDelta
          } else {
            const { value: txIndex, nextIndex: txNextIndex } = decodeVarint(
              payload,
              index
            )
            index = txNextIndex
            id.block += blockDelta
            id.tx = txIndex
          }
          const { value: amount, nextIndex: amountNextIndex } = decodeVarint(
            payload,
            index
          )
          index = amountNextIndex
          const { value: output, nextIndex: outputNextIndex } = decodeVarint(
            payload,
            index
          )
          index = outputNextIndex
          edicts.push({
            id: `${id.block}:${id.tx}`,
            amount: amount.toString(),
            output: output.toString(),
          })
        }
        result.Body = edicts
        break
      case Tag.Flags:
        const { value: flagsValue, nextIndex: flagsNextIndex } = decodeVarint(
          payload,
          index
        )
        result.Flags = flagsValue.toString()
        index = flagsNextIndex
        break
      case Tag.Rune:
        const { value: runeValue, nextIndex: runeNextIndex } = decodeVarint(
          payload,
          index
        )
        result.Rune = runeValue.toString()
        index = runeNextIndex
        break
      case Tag.Divisibility:
        const { value: divisibilityValue, nextIndex: divisibilityNextIndex } =
          decodeVarint(payload, index)
        result.Divisibility = divisibilityValue.toString()
        index = divisibilityNextIndex
        break
      case Tag.Spacers:
        const { value: spacersValue, nextIndex: spacersNextIndex } =
          decodeVarint(payload, index)
        // Ensure spacersValue is within the 32-bit unsigned integer range
        if (spacersValue <= BigInt(2 ** 32 - 1)) {
          result.Spacers = Number(spacersValue).toString() // Convert BigInt to a number
        } else {
          // Handle error for spacersValue out of range if needed
          console.error('Spacers value is out of the 32-bit range.')
        }
        index = spacersNextIndex
        break
      case Tag.Symbol:
        const { value: symbolValue, nextIndex: symbolNextIndex } = decodeVarint(
          payload,
          index
        )
        result.Symbol = String.fromCharCode(Number(symbolValue))
        index = symbolNextIndex
        break
      case Tag.Premine:
        const { value: premineValue, nextIndex: premineNextIndex } =
          decodeVarint(payload, index)
        result.Premine = premineValue.toString()
        index = premineNextIndex
        break
      case Tag.Cap:
        const { value: capValue, nextIndex: capNextIndex } = decodeVarint(
          payload,
          index
        )
        result.Cap = capValue.toString()
        index = capNextIndex
        break
      case Tag.Amount:
        const { value: amountValue, nextIndex: amountNextIndex } = decodeVarint(
          payload,
          index
        )
        result.Amount = amountValue.toString()
        index = amountNextIndex
        break
      case Tag.HeightStart:
        const { value: heightStartValue, nextIndex: heightStartNextIndex } =
          decodeVarint(payload, index)
        result.HeightStart = heightStartValue.toString()
        index = heightStartNextIndex
        break
      case Tag.HeightEnd:
        const { value: heightEndValue, nextIndex: heightEndNextIndex } =
          decodeVarint(payload, index)
        result.HeightEnd = heightEndValue.toString()
        index = heightEndNextIndex
        break
      case Tag.OffsetStart:
        const { value: offsetStartValue, nextIndex: offsetStartNextIndex } =
          decodeVarint(payload, index)
        result.OffsetStart = offsetStartValue.toString()
        index = offsetStartNextIndex
        break
      case Tag.OffsetEnd:
        const { value: offsetEndValue, nextIndex: offsetEndNextIndex } =
          decodeVarint(payload, index)
        result.OffsetEnd = offsetEndValue.toString()
        index = offsetEndNextIndex
        break
      case Tag.Mint:
        // Mints have a block and tx
        result.Mint = {}

        // Block
        const { value: mintBlockValue, nextIndex: mintBlockNextIndex } =
          decodeVarint(payload, index)
        result.Mint.block = mintBlockValue.toString()
        index = mintBlockNextIndex

        // Recent mint transactions have two '14' tags... strange...
        const { value: tag, nextIndex } = decodeVarint(payload, index)
        index = nextIndex

        // tx
        const { value: mintTxValue, nextIndex: mintTxNextIndex } = decodeVarint(
          payload,
          index
        )
        result.Mint.tx = mintTxValue.toString()
        index = mintTxNextIndex
        break
      case Tag.Pointer:
        const { value: pointerValue, nextIndex: pointerNextIndex } =
          decodeVarint(payload, index)
        result.Pointer = pointerValue.toString()
        index = pointerNextIndex
        break
      case Tag.Cenotaph:
        result.Cenotaph = true
        break
      default:
        if (Number(tag) % 2 === 0) {
          result.Cenotaph = true
        }
        break
    }
  }

  return result
}
