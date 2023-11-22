import * as bitcoin from 'bitcoinjs-lib'
import ECPairFactory from 'ecpair'
import ecc from '@bitcoinerlab/secp256k1'
bitcoin.initEccLib(ecc)
import { AddressType, UnspentOutput, TxInput } from '../shared/interface'
import BigNumber from 'bignumber.js'
import { maximumScriptBytes } from './constants'
import axios from 'axios'
import { getUnspentOutputs } from '../transactions'

export interface IBlockchainInfoUTXO {
  tx_hash_big_endian: string
  tx_hash: string
  tx_output_n: number
  script: string
  value: number
  value_hex: string
  confirmations: number
  tx_index: number
}

export interface IBISWalletIx {
  validity: any
  isBrc: boolean
  isSns: boolean
  name: any
  amount: any
  isValidTransfer: any
  operation: any
  ticker: any
  isJson: boolean
  content?: string
  inscription_name: any
  inscription_id: string
  inscription_number: number
  metadata: any
  owner_wallet_addr: string
  mime_type: string
  last_sale_price: any
  slug: any
  collection_name: any
  content_url: string
  bis_url: string

  wallet?: string
  media_length?: number
  genesis_ts?: number
  genesis_height?: number
  genesis_fee?: number
  output_value?: number
  satpoint?: string
  collection_slug?: string
  confirmations?: number
}

export const ECPair = ECPairFactory(ecc)

export const assertHex = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return bitcoin.crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  )
}

export function tweakSigner(
  signer: bitcoin.Signer,
  opts: any = {}
): bitcoin.Signer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey: Uint8Array | undefined = signer.privateKey!
  if (!privateKey) {
    throw new Error('Private key required')
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey)
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(assertHex(signer.publicKey), opts.tweakHash)
  )
  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!')
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  })
}

export function satoshisToAmount(val: number) {
  const num = new BigNumber(val)
  return num.dividedBy(100000000).toFixed(8)
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function amountToSatoshis(val: any) {
  const num = new BigNumber(val)
  return num.multipliedBy(100000000).toNumber()
}

export const validator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer
): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature)

export function utxoToInput(utxo: UnspentOutput, publicKey: Buffer): TxInput {
  let data
  console.log(utxo)
  switch (utxo.addressType) {
    case AddressType.P2TR:
      data = {
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
        tapInternalKey: assertHex(publicKey),
      }
      return {
        data,
        utxo,
      }

    case AddressType.P2WPKH:
      data = {
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
      }
      return {
        data,
        utxo,
      }

    case AddressType.P2PKH:
      data = {
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
      }
      return {
        data,
        utxo,
      }

    case AddressType.P2SH_P2WPKH:
      const redeemData = bitcoin.payments.p2wpkh({ pubkey: publicKey })
      data = {
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
        redeemScript: redeemData.output,
      }
      return {
        data,
        utxo,
      }

    default:
      data = {
        hash: '',
        index: 0,
        witnessUtxo: {
          value: 0,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
      }
      return {
        data,
        utxo,
      }
  }
}

export const getWitnessDataChunk = function (
  content: string,
  encodeType: BufferEncoding = 'utf8'
) {
  const buffered = Buffer.from(content, encodeType)
  const contentChunks: Buffer[] = []
  let chunks = 0

  while (chunks < buffered.byteLength) {
    const split = buffered.subarray(chunks, chunks + maximumScriptBytes)
    chunks += split.byteLength
    contentChunks.push(split)
  }

  return contentChunks
}

export const getUnspentsWithConfirmationsForAddress = async (
  address: string
) => {
  try {
    return await getUnspentOutputs(address).then(
      (unspents) =>
        unspents?.unspent_outputs.filter(
          (utxo: IBlockchainInfoUTXO) => utxo.confirmations >= 0
        ) as IBlockchainInfoUTXO[]
    )
  } catch (e: any) {
    throw new Error(e)
  }
}

export const getUTXOWorthGreatestValueForAddress = async (address: string) => {
  const unspents = await getUnspentsWithConfirmationsForAddress(address)
  return unspents.reduce(function (prev, current) {
    return prev.value > current.value ? prev : current
  })
}

export const getSatpointFromUtxo = (utxo: IBlockchainInfoUTXO) => {
  return `${utxo.tx_hash_big_endian}:${utxo.tx_output_n}:0`
}

export const getUnspentsForAddressInOrderByValue = async (address: string) => {
  const unspents = await getUnspentsWithConfirmationsForAddress(address)
  return unspents.sort((a, b) => b.value - a.value)
}

export const getInscriptionsByWalletBIS = async (
  walletAddress: string,
  offset: number = 0
) => {
  return (await axios
    .get(
      `https://api.bestinslot.xyz/v3/wallet/inscriptions?address=${walletAddress}&sort_by=inscr_num&order=asc&offset=${offset}&count=100`,
      {
        headers: {
          'X-Api-Key': 'abbfff3d-49fa-4f7f-883a-0a5fce48a9f1',
        },
      }
    )
    .then((res) => res.data?.data)) as IBISWalletIx[]
}

export const getUTXOsToCoverAmount = async (
  address: string,
  amountNeeded: number,
  inscriptionLocs?: string[],
  usedUtxos?: IBlockchainInfoUTXO[]
) => {
  const unspentsOrderedByValue = await getUnspentsForAddressInOrderByValue(
    address
  )
  const retrievedIxs = await getInscriptionsByWalletBIS(address)
  const bisInscriptionLocs = retrievedIxs.map(
    (utxo) => utxo.satpoint
  ) as string[]

  if (bisInscriptionLocs.length === 0) {
    inscriptionLocs = []
  } else {
    inscriptionLocs = bisInscriptionLocs
  }

  let sum = 0
  const result: IBlockchainInfoUTXO[] = []

  for await (let utxo of unspentsOrderedByValue) {
    const currentUTXO = utxo
    const utxoSatpoint = getSatpointFromUtxo(currentUTXO)
    if (
      (inscriptionLocs &&
        inscriptionLocs?.find((utxoLoc: any) => utxoLoc === utxoSatpoint)) ||
      currentUTXO.value <= 546
    ) {
      continue
    }

    if (
      (usedUtxos &&
        usedUtxos?.find(
          (utxoLoc: IBlockchainInfoUTXO) =>
            utxo.tx_hash_big_endian === utxoLoc.tx_hash_big_endian &&
            utxo.tx_output_n === utxoLoc.tx_output_n
        )) ||
      currentUTXO.value <= 546
    ) {
      console.log('SKIPPIN!!!!!!!')
      continue
    }

    sum += currentUTXO.value
    result.push(currentUTXO)
    if (sum > amountNeeded) {
      console.log('AMOUNT RETRIEVED: ', sum)
      return result
    }
  }

  return [] as IBlockchainInfoUTXO[]
}

export const getUTXOsToCoverAmountWithRemainder = async (
  address: string,
  amountNeeded: number,
  inscriptionLocs?: string[]
) => {
  const unspentsOrderedByValue = await getUnspentsForAddressInOrderByValue(
    address
  )
  const retrievedIxs = await getInscriptionsByWalletBIS(address)
  const bisInscriptionLocs = retrievedIxs.map(
    (utxo) => utxo.satpoint
  ) as string[]

  if (bisInscriptionLocs.length === 0) {
    inscriptionLocs = []
  } else {
    inscriptionLocs = bisInscriptionLocs
  }

  let sum = 0
  const result: IBlockchainInfoUTXO[] = []

  for await (let utxo of unspentsOrderedByValue) {
    const currentUTXO = utxo
    const utxoSatpoint = getSatpointFromUtxo(currentUTXO)
    if (
      (inscriptionLocs &&
        inscriptionLocs?.find((utxoLoc: any) => utxoLoc === utxoSatpoint)) ||
      currentUTXO.value <= 546
    ) {
      continue
    }

    sum += currentUTXO.value
    result.push(currentUTXO)
    if (sum > amountNeeded) {
      return result
    }
  }

  return result as IBlockchainInfoUTXO[]
}

export const getTheOtherUTXOsToCoverAmount = async (
  address: string,
  amountNeeded: number,
  inscriptionLocs?: string[]
) => {
  const unspentsOrderedByValue = await getUnspentOutputs(address)

  const retrievedIxs = await getInscriptionsByWalletBIS(address)
  const bisInscriptions = retrievedIxs.map((utxo) => utxo.satpoint) as string[]

  if (bisInscriptions.length === 0) {
    inscriptionLocs = []
  } else {
    inscriptionLocs = bisInscriptions
  }

  let sum = 0
  const result: IBlockchainInfoUTXO[] = []

  for (let i = 0; i < unspentsOrderedByValue.length; i++) {
    const currentUTXO = unspentsOrderedByValue.reverse()[i]
    const utxoSatpoint = getSatpointFromUtxo(currentUTXO)
    if (
      inscriptionLocs &&
      inscriptionLocs?.find((utxoLoc: any) => utxoLoc === utxoSatpoint)
    ) {
      continue
    }

    sum += currentUTXO.value
    result.push(currentUTXO)

    if (sum > amountNeeded) {
      return result
    }
  }

  return [] as IBlockchainInfoUTXO[]
}

export const getUTXOByAddressTxIDAndVOut = async (
  address: string,
  txId: string,
  vOut: number
) => {
  const unspents = await getUnspentsWithConfirmationsForAddress(address)
  return unspents.find(
    (utxo) => utxo.tx_hash_big_endian === txId && utxo.tx_output_n === vOut
  )
}

export function calculateAmountGathered(utxoArray: IBlockchainInfoUTXO[]) {
  return utxoArray?.reduce((prev, currentValue) => prev + currentValue.value, 0)
}

export const getScriptForAddress = async (address: string) => {
  const utxos = await getUnspentOutputs(address)
  const { script } = utxos.unspent_outputs[0]
  return script
}
