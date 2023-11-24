import * as bitcoin from 'bitcoinjs-lib'
import ECPairFactory from 'ecpair'
import ecc from '@bitcoinerlab/secp256k1'
bitcoin.initEccLib(ecc)
import { AddressType, UnspentOutput, TxInput, IBlockchainInfoUTXO } from '../shared/interface'
import BigNumber from 'bignumber.js'
import { maximumScriptBytes } from './constants'
import axios from 'axios'
import { getUnspentOutputs, getAddressType } from '../transactions'
import { Wallet } from '../oylib'


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

const RequiredPath = [
  "m/44'/0'/0'/0", // P2PKH (Legacy)
  "m/49'/0'/0'/0", // P2SH-P2WPKH (Nested SegWit)
  "m/84'/0'/0'/0", // P2WPKH (SegWit)
  "m/86'/0'/0'/0", // P2TR (Taproot)
]

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

// export const inscribe = async ({
//   ticker,
//   amount,
//   inputAddress,
//   outputAddress,
//   commitTxId,
//   isDry,
// }: {
//   ticker: string
//   amount: number
//   inputAddress: string
//   outputAddress: string
//   commitTxId?: string
//   isDry?: boolean
// }) => {
//   const { fastestFee } = await getRecommendedBTCFeesMempool()
//   const inputs = 1
//   const vB = inputs * 149 + 3 * 32 + 12
//   const minerFee = vB * fastestFee
//   const fees = minerFee + 4000
//   console.log(fees)

//   try {
//     const secret =
//       'd84d671cbd24a08db5ed43b93102484bd9bd8beb657e784451a226cf6a6e259b'

//     const secKey = ecc.keys.get_seckey(String(secret))
//     const pubKey = ecc.keys.get_pubkey(String(secret), true)
//     const content = `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amount}"}`

//     const script = createInscriptionScript(pubKey, content)
//     const tapleaf = Tap.encodeScript(script)
//     const [tpubkey, cblock] = Tap.getPubKey(pubKey, { target: tapleaf })
//     const address = Address.p2tr.fromPubKey(tpubkey)

//     let utxosGathered

//     if (!commitTxId) {
//       let reimbursementAmount = 0
//       const psbt = new bitcoin.Psbt()
//       utxosGathered = await getUTXOsToCoverAmountWithRemainder(
//         inputAddress,
//         fees
//       )
//       const amountGathered = calculateAmountGathered(utxosGathered)
//       console.log(amountGathered)
//       if (amountGathered < fees) {
//         console.log('WAHAHAHAHAH')
//         return { error: 'insuffICIENT funds for inscribe' }
//       }

//       reimbursementAmount = amountGathered - fees

//       for await (let utxo of utxosGathered) {
//         const {
//           tx_hash_big_endian,
//           tx_output_n,
//           value,
//           script: outputScript,
//         } = utxo

//         psbt.addInput({
//           hash: tx_hash_big_endian,
//           index: tx_output_n,
//           witnessUtxo: { value, script: Buffer.from(outputScript, 'hex') },
//         })
//       }

//       psbt.addOutput({
//         value: INSCRIPTION_PREPARE_SAT_AMOUNT,
//         address: address, // address for inscriber for the user
//       })

//       if (reimbursementAmount > 546) {
//         psbt.addOutput({
//           value: reimbursementAmount,
//           address: inputAddress,
//         })
//       }

//       return {
//         psbtHex: psbt.toHex(),
//         psbtBase64: psbt.toBase64(),
//         utxosGathered,
//       }
//     }

//     const txData = Tx.create({
//       vin: [
//         {
//           txid: commitTxId,
//           vout: 0,
//           prevout: {
//             value: INSCRIPTION_PREPARE_SAT_AMOUNT,
//             scriptPubKey: ['OP_1', tpubkey],
//           },
//         },
//       ],
//       vout: [
//         {
//           value: 546,
//           scriptPubKey: Address.toScriptPubKey(outputAddress),
//         },
//       ],
//     })

//     const sig = Signer.taproot.sign(secKey, txData, 0, { extension: tapleaf })
//     txData.vin[0].witness = [sig, script, cblock]
//     if (!isDry) {
//       return await callBTCRPCEndpoint(
//         'sendrawtransaction',
//         Tx.encode(txData).hex
//       )
//     } else {
//       return { result: Tx.util.getTxid(txData) }
//     }
//   } catch (e: any) {
//     // console.error(e);
//     return { error: e.message }
//   }
// }

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function createSegwitSigner({
  mnemonic,
  segwitAddress,
  segwitPubKey,
}: {
  mnemonic: string
  segwitAddress: string
  segwitPubKey: string
}) {
  if (segwitAddress && segwitPubKey) {
    let payload: any
    const wallet = new Wallet()
    const segwitAddressType = getAddressType(segwitAddress)
    if (segwitAddressType == null) {
      throw Error('Unrecognized Address Type')
    }
    if (segwitAddressType === 2) {
      payload = await wallet.fromPhrase({
        mnemonic: mnemonic.trim(),
        hdPath: RequiredPath[1],
        type: 'nested-segwit',
      })
    }
    if (segwitAddressType === 3) {
      payload = await wallet.fromPhrase({
        mnemonic: mnemonic.trim(),
        hdPath: RequiredPath[2],
        type: 'native-segwit',
      })
    }
    const segwitKeyring = payload.keyring.keyring
    const segwitSigner = segwitKeyring.signTransaction.bind(segwitKeyring)
    return segwitSigner
  }
  return undefined
}

export async function createTaprootSigner({
  mnemonic,
  taprootAddress,
}: {
  mnemonic: string
  taprootAddress: string
}) {
  const addressType = getAddressType(taprootAddress)
  if (addressType == null) {
    throw Error('Unrecognized Address Type')
  }
  const tapWallet = new Wallet()

  const tapPayload = await tapWallet.fromPhrase({
    mnemonic: mnemonic.trim(),
    hdPath: RequiredPath[3],
    type: 'taproot',
  })

  const tapKeyring = tapPayload.keyring.keyring
  const taprootSigner = tapKeyring.signTransaction.bind(tapKeyring)
  return taprootSigner
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
