import * as bitcoin from 'bitcoinjs-lib'
import ECPairFactory from 'ecpair'
import ecc from '@bitcoinerlab/secp256k1'
import {
  AddressType,
  BitcoinPaymentType,
  IBlockchainInfoUTXO,
  Network,
  ToSignInput,
  TxInput,
  UnspentOutput,
} from '../shared/interface'
import BigNumber from 'bignumber.js'
import { maximumScriptBytes } from './constants'
import axios from 'axios'
import { Address, Signer, Tap, Tx } from '@cmdcode/tapscript'
import * as ecc2 from '@cmdcode/crypto-utils'
import {
  addInscriptionUtxo,
  findUtxosToCoverAmount,
  getUtxosForFees,
  usableUtxo,
  Utxo,
} from '../txbuilder/buildOrdTx'
import { isTaprootInput, toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { SandshrewBitcoinClient } from '../rpclient/sandshrew'
import { EsploraRpc } from '../rpclient/esplora'
import { getAddressType } from '../transactions'

bitcoin.initEccLib(ecc)

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

export const addressTypeMap = { 0: 'p2pkh', 1: 'p2tr', 2: 'p2sh', 3: 'p2wpkh' }
export const inscriptionSats = 546

export const ECPair = ECPairFactory(ecc)

export const assertHex = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return bitcoin.crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  )
}

export function getNetwork(
  value: Network | 'main' | 'mainnet' | 'regtest' | 'testnet'
) {
  if (value === 'mainnet' || value === 'main') {
    return bitcoin.networks['bitcoin']
  }

  return bitcoin.networks[value]
}

export function checkPaymentType(
  payment: bitcoin.PaymentCreator,
  network: Network
) {
  return (script: Buffer) => {
    try {
      return payment({ output: script, network: getNetwork(network) })
    } catch (error) {
      return false
    }
  }
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

export const getSatpointFromUtxo = (utxo: IBlockchainInfoUTXO) => {
  return `${utxo.tx_hash_big_endian}:${utxo.tx_output_n}:0`
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

export function calculateAmountGathered(utxoArray: IBlockchainInfoUTXO[]) {
  return utxoArray?.reduce((prev, currentValue) => prev + currentValue.value, 0)
}

export function calculateAmountGatheredUtxo(utxoArray: Utxo[]) {
  return utxoArray?.reduce(
    (prev, currentValue) => prev + currentValue.satoshis,
    0
  )
}

export const formatOptionsToSignInputs = async ({
  _psbt,
  pubkey,
  segwitPubkey,
  segwitAddress,
  taprootAddress,
  network,
}: {
  _psbt: bitcoin.Psbt
  pubkey: string
  segwitPubkey: string
  segwitAddress: string
  taprootAddress: string
  network: bitcoin.Network
}) => {
  let toSignInputs: ToSignInput[] = []
  let index = 0
  for await (const v of _psbt.data.inputs) {
    let script: any = null
    let value = 0
    const isSigned = v.finalScriptSig || v.finalScriptWitness
    const lostInternalPubkey = !v.tapInternalKey
    if (v.witnessUtxo) {
      script = v.witnessUtxo.script
      value = v.witnessUtxo.value
    } else if (v.nonWitnessUtxo) {
      const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo)
      const output = tx.outs[_psbt.txInputs[index].index]
      script = output.script
      value = output.value
    }

    if (!isSigned || lostInternalPubkey) {
      const tapInternalKey = assertHex(Buffer.from(pubkey, 'hex'))
      const p2tr = bitcoin.payments.p2tr({
        internalPubkey: tapInternalKey,
        network: network,
      })
      if (
        v.witnessUtxo?.script.toString('hex') == p2tr.output?.toString('hex')
      ) {
        v.tapInternalKey = tapInternalKey
        if (v.tapInternalKey) {
          toSignInputs.push({
            index: index,
            publicKey: pubkey,
            sighashTypes: v.sighashType ? [v.sighashType] : undefined,
          })
        }
      }
    }

    if (script && !isSigned && !isTaprootInput(v)) {
      toSignInputs.push({
        index: index,
        publicKey: segwitPubkey,
        sighashTypes: v.sighashType ? [v.sighashType] : undefined,
      })
    }

    index++
  }

  return toSignInputs
}

export const formatInputsToSign = async ({
  _psbt,
  senderPublicKey,
  network,
}: {
  _psbt: bitcoin.Psbt
  senderPublicKey: string
  network: bitcoin.Network
}) => {
  let index = 0
  for await (const v of _psbt.data.inputs) {
    const isSigned = v.finalScriptSig || v.finalScriptWitness
    const lostInternalPubkey = !v.tapInternalKey
    if (!isSigned || lostInternalPubkey) {
      const tapInternalKey = toXOnly(Buffer.from(senderPublicKey, 'hex'))
      const p2tr = bitcoin.payments.p2tr({
        internalPubkey: tapInternalKey,
        network: network,
      })
      if (
        v.witnessUtxo?.script.toString('hex') === p2tr.output?.toString('hex')
      ) {
        v.tapInternalKey = tapInternalKey
      }
    }
    index++
  }

  return _psbt
}

export const timeout = async (n) =>
  await new Promise((resolve) => setTimeout(resolve, n))

export const signInputs = async (
  psbt: bitcoin.Psbt,
  toSignInputs: ToSignInput[],
  taprootPubkey: string,
  segwitPubKey: string,
  segwitSigner: any,
  taprootSigner: any
) => {
  const taprootInputs: ToSignInput[] = []
  const segwitInputs: ToSignInput[] = []
  const inputs = psbt.data.inputs
  toSignInputs.forEach(({ publicKey }, i) => {
    const input = inputs[i]
    if (publicKey === taprootPubkey && !input.finalScriptWitness) {
      taprootInputs.push(toSignInputs[i])
    }
    if (segwitPubKey && segwitSigner) {
      if (publicKey === segwitPubKey) {
        segwitInputs.push(toSignInputs[i])
      }
    }
  })
  if (taprootInputs.length > 0) {
    await taprootSigner(psbt, taprootInputs)
  }
  if (segwitSigner && segwitInputs.length > 0) {
    await segwitSigner(psbt, segwitInputs)
  }
  return psbt
}

export const createInscriptionScript = (pubKey: any, content: any) => {
  const mimeType = 'text/plain;charset=utf-8'
  const textEncoder = new TextEncoder()
  const marker = textEncoder.encode('ord')
  return [
    pubKey,
    'OP_CHECKSIG',
    'OP_0',
    'OP_IF',
    marker,
    '01',
    textEncoder.encode(mimeType),
    'OP_0',
    textEncoder.encode(content),
    'OP_ENDIF',
  ] as string[]
}

export let RPC_ADDR =
  'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094'

export const callBTCRPCEndpoint = async (
  method: string,
  params: string | string[],
  network: string
) => {
  if (network === 'testnet') {
    RPC_ADDR =
      'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094'
  }
  if (network === 'regtest') {
    RPC_ADDR === 'http://localhost:3000/v1/regtest'
  }
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: method,
    method: method,
    params: [params],
  })

  // @ts-ignore
  return await axios
    .post(RPC_ADDR, data, {
      headers: {
        'content-type': 'application/json',
      },
    })
    .then((res) => res.data)
    .catch((e) => {
      console.error(e.response)
      throw e
    })
}

export async function waitForTransaction({
  txId,
  sandshrewBtcClient,
}: {
  txId: string
  sandshrewBtcClient: SandshrewBitcoinClient
}): Promise<[boolean, any?]> {
  console.log('WAITING FOR TRANSACTION: ', txId)
  const timeout: number = 60000 // 1 minute in milliseconds

  const startTime: number = Date.now()

  while (true) {
    try {
      // Call the endpoint to check the transaction
      const result = await sandshrewBtcClient.bitcoindRpc.getMemPoolEntry(txId)

      // Check if the transaction is found
      if (result) {
        console.log('Transaction found in mempool:', txId)
        return [true, result]
      }

      // Check for timeout
      if (Date.now() - startTime > timeout) {
        console.log('Timeout reached, stopping search.')
        return [false]
      }

      // Wait for 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
      // Check for timeout
      if (Date.now() - startTime > timeout) {
        console.log('Timeout reached, stopping search.')
        return [false]
      }

      // Wait for 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

export async function getOutputValueByVOutIndex({
  txId,
  vOut,
  esploraRpc,
}: {
  txId: string
  vOut: number
  esploraRpc: EsploraRpc
}): Promise<any[] | null> {
  const timeout: number = 60000 // 1 minute in milliseconds
  const startTime: number = Date.now()

  while (true) {
    const txDetails = await esploraRpc.getTxInfo(txId)

    if (txDetails?.vout && txDetails.vout.length > 0) {
      return [txDetails.vout[vOut].value, txDetails.vout[vOut].scriptpubkey]
    }

    // Check for timeout
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout reached, stopping search.')
    }

    // Wait for 5 seconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
}

export function calculateTaprootTxSize(
  taprootInputCount: number,
  nonTaprootInputCount: number,
  outputCount: number
): number {
  const baseTxSize = 10 // Base transaction size without inputs/outputs

  // Size contributions from inputs
  const taprootInputSize = 57 // Average size of a Taproot input (can vary)
  const nonTaprootInputSize = 41 // Average size of a non-Taproot input (can vary)

  const outputSize = 34 // Average size of an output (can vary)

  const totalInputSize =
    taprootInputCount * taprootInputSize +
    nonTaprootInputCount * nonTaprootInputSize
  const totalOutputSize = outputCount * outputSize

  return baseTxSize + totalInputSize + totalOutputSize
}

export async function getRawTxnHashFromTxnId(txnId: string) {
  const res = await axios.post(
    'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094',
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'btc_getrawtransaction',
      params: [txnId],
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )

  return res.data
}

export const isP2PKH = (
  script: Buffer,
  network: Network
): BitcoinPaymentType => {
  const p2pkh = checkPaymentType(bitcoin.payments.p2pkh, network)(script)
  return {
    type: 'p2pkh',
    payload: p2pkh,
  }
}
export const isP2WPKH = (
  script: Buffer,
  network: Network
): BitcoinPaymentType => {
  const p2wpkh = checkPaymentType(bitcoin.payments.p2wpkh, network)(script)
  return {
    type: 'p2wpkh',
    payload: p2wpkh,
  }
}
export const isP2WSHScript = (
  script: Buffer,
  network: Network
): BitcoinPaymentType => {
  const p2wsh = checkPaymentType(bitcoin.payments.p2wsh, network)(script)
  return {
    type: 'p2sh',
    payload: p2wsh,
  }
}
export const isP2SHScript = (
  script: Buffer,
  network: Network
): BitcoinPaymentType => {
  const p2sh = checkPaymentType(bitcoin.payments.p2sh, network)(script)
  return {
    type: 'p2sh',
    payload: p2sh,
  }
}
export const isP2TR = (
  script: Buffer,
  network: Network
): BitcoinPaymentType => {
  const p2tr = checkPaymentType(bitcoin.payments.p2tr, network)(script)
  return {
    type: 'p2tr',
    payload: p2tr,
  }
}

export const sendCollectible = async ({
  inscriptionId,
  inputAddress,
  outputAddress,
  taprootPublicKey,
  segwitPublicKey,
  segwitAddress,
  isDry,
  segwitSigner,
  taprootSigner,
  payFeesWithSegwit = false,
  feeRate,
  network,
  taprootUtxos,
  segwitUtxos,
  metaOutputValue,
  sandshrewBtcClient,
}: {
  inscriptionId: string
  inputAddress: string
  outputAddress: string
  mnemonic: string
  taprootPublicKey: string
  segwitPublicKey: string
  segwitAddress: string
  isDry?: boolean
  feeRate: number
  segwitSigner: any
  taprootSigner: any
  payFeesWithSegwit?: boolean
  network: 'testnet' | 'main' | 'regtest'
  taprootUtxos: Utxo[]
  segwitUtxos: Utxo[]
  metaOutputValue: number
  sandshrewBtcClient: SandshrewBitcoinClient
}) => {
  const psbt = new bitcoin.Psbt({ network: getNetwork(network) })

  const utxosToSend = await insertCollectibleUtxo({
    taprootUtxos: taprootUtxos,
    inscriptionId: inscriptionId,
    toAddress: outputAddress,
    psbt: psbt,
  })

  psbt.txOutputs[0].value = metaOutputValue

  await getUtxosForFees({
    payFeesWithSegwit: payFeesWithSegwit,
    psbtTx: psbt,
    taprootUtxos: taprootUtxos,
    segwitUtxos: segwitUtxos,
    segwitAddress: segwitAddress,
    feeRate: feeRate,
    taprootAddress: inputAddress,
    segwitPubKey: segwitPublicKey,
    utxosToSend: utxosToSend,
    network: getNetwork(network),
    fromAddress: inputAddress,
  })

  const toSignInputs: ToSignInput[] = await formatOptionsToSignInputs({
    _psbt: psbt,
    pubkey: taprootPublicKey,
    segwitPubkey: segwitPublicKey,
    segwitAddress: segwitAddress,
    taprootAddress: inputAddress,
    network: getNetwork(network),
  })

  const signedPsbt = await signInputs(
    psbt,
    toSignInputs,
    taprootPublicKey,
    segwitPublicKey,
    segwitSigner,
    taprootSigner
  )

  signedPsbt.finalizeAllInputs()

  const rawTx = signedPsbt.extractTransaction().toHex()
  const txId = signedPsbt.extractTransaction().getId()

  const [result] = await sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
    rawTx,
  ])

  if (!result.allowed) {
    throw new Error(result['reject-reason'])
  }

  if (!isDry) {
    await sandshrewBtcClient.bitcoindRpc.sendRawTransaction(rawTx)
  }

  return { txId, rawTx }
}

const insertCollectibleUtxo = async ({
  taprootUtxos,
  inscriptionId,
  toAddress,
  psbt,
}: {
  taprootUtxos: any[]
  inscriptionId: string
  toAddress: string
  psbt: bitcoin.Psbt
}) => {
  const { metaUtxos } = taprootUtxos.reduce(
    (acc, utxo) => {
      utxo.inscriptions.length
        ? acc.metaUtxos.push(utxo)
        : acc.nonMetaUtxos.push(utxo)
      return acc
    },
    { metaUtxos: [], nonMetaUtxos: [] }
  )

  return await addInscriptionUtxo({
    metaUtxos: metaUtxos,
    inscriptionId: inscriptionId,
    toAddress: toAddress,
    psbtTx: psbt,
  })
}

export const filterTaprootUtxos = async ({
  taprootUtxos,
}: {
  taprootUtxos: any[]
}) => {
  const { nonMetaUtxos } = taprootUtxos.reduce(
    (acc, utxo) => {
      utxo.inscriptions.length > 0 || utxo.satoshis === 546
        ? acc.metaUtxos.push(utxo)
        : acc.nonMetaUtxos.push(utxo)
      return acc
    },
    { metaUtxos: [], nonMetaUtxos: [] }
  )
  return nonMetaUtxos
}

export const filterUtxos = async ({ utxos }: { utxos: any[] }) => {
  const { nonMetaUtxos } = utxos.reduce(
    (acc, utxo) => {
      utxo.value === 546 && utxo.vout === 0
        ? acc.metaUtxos.push(utxo)
        : acc.nonMetaUtxos.push(utxo)
      return acc
    },
    { metaUtxos: [], nonMetaUtxos: [] }
  )
  return nonMetaUtxos
}

export const addBtcUtxo = async ({
  utxos,
  toAddress,
  fromAddress,
  psbt,
  amount,
  feeRate,
  network,
  spendAddress,
  senderPubKey,
  altSpendAddress,
  altSpendPubKey,
  altSpendUtxos,
}: {
  utxos: any[]
  toAddress: string
  fromAddress: string
  psbt: bitcoin.Psbt
  feeRate: number
  amount: number
  network: bitcoin.Network
  spendAddress: string
  senderPubKey: string
  altSpendAddress?: string
  altSpendPubKey?: string
  altSpendUtxos?: Utxo[]
}) => {
  const spendableUtxos = await filterTaprootUtxos({
    taprootUtxos: utxos,
  })
  const txSize = calculateTaprootTxSize(2, 0, 2)
  const fee = txSize * feeRate < 250 ? 250 : txSize * feeRate

  let utxosToSend: any = findUtxosToCoverAmount(spendableUtxos, amount + fee)
  let usingAlt = false

  if (!utxosToSend) {
    const unFilteredAltUtxos = await filterTaprootUtxos({
      taprootUtxos: altSpendUtxos,
    })
    utxosToSend = findUtxosToCoverAmount(unFilteredAltUtxos, amount + fee)
    if (!utxosToSend) {
      throw new Error('Insufficient Balance')
    }
    usingAlt = true
  }
  const amountGathered = calculateAmountGatheredUtxo(utxosToSend.selectedUtxos)

  for (let i = 0; i < utxosToSend.selectedUtxos.length; i++) {
    psbt.addInput({
      hash: utxosToSend.selectedUtxos[i].txId,
      index: utxosToSend.selectedUtxos[i].outputIndex,
      witnessUtxo: {
        value: utxosToSend.selectedUtxos[i].satoshis,
        script: Buffer.from(utxosToSend.selectedUtxos[i].scriptPk, 'hex'),
      },
    })
  }

  psbt.addOutput({
    address: toAddress,
    value: amount,
  })

  const changeAmount = amountGathered - amount - fee
  if (changeAmount > 546) {
    psbt.addOutput({
      address: spendAddress,
      value: changeAmount,
    })
  }

  const updatedPsbt = await formatInputsToSign({
    _psbt: psbt,
    senderPublicKey: usingAlt ? altSpendPubKey : senderPubKey,
    network,
  })

  return updatedPsbt
}

export const isValidJSON = (str: string) => {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}
