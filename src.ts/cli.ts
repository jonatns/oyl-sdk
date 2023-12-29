import yargs from 'yargs'
import { camelCase } from 'change-case'
import 'dotenv/config'
import { NESTED_SEGWIT_HD_PATH, Oyl, TAPROOT_HD_PATH } from './oylib'
import { Aggregator } from './PSBTAggregator'
import * as bitcoin from 'bitcoinjs-lib'
import axios from 'axios'
import * as ecc2 from '@bitcoinerlab/secp256k1'
import { BuildMarketplaceTransaction } from './txbuilder/buildMarketplaceTransaction'
import { NetworkOptions } from './shared/interface'

bitcoin.initEccLib(ecc2)

export async function loadRpc(options) {
  const wallet = new Oyl()
  try {
    const newWallet = await wallet.getUtxosArtifacts({
      address: 'bc1pmtkac5u6rx7vkwhcnt0gal5muejwhp8hcrmx2yhvjg8nenu7rp3syw6yp0',
    })
    console.log('newWallet:', newWallet)
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function testMarketplaceBuy() {
  const options = {
    address: process.env.TAPROOT_ADDRESS,
    pubKey: process.env.TAPROOT_PUBKEY,
    feeRate: parseFloat(process.env.FEE_RATE),
    psbtBase64: process.env.PSBT_BASE64,
    price: 0.001,
  }
  const intent = new BuildMarketplaceTransaction(options)
  const builder = await intent.psbtBuilder()
  console.log(builder)
}

export async function testAggregator() {
  const aggregator = new Aggregator()
  const aggregated = await aggregator.fetchAndAggregateOffers(
    'ordi',
    20,
    110000
  )

  const formatOffers = (offers) =>
    offers.map((offer) => ({
      amount: offer.amount,
      unitPrice: offer.unitPrice,
      nftId: offer.offerId,
      marketplace: offer.marketplace,
    }))

  console.log('Aggregated Offers')
  console.log('Best Price Offers:', formatOffers(aggregated.bestPrice.offers))
  console.log(
    'Closest Match Offers:',
    formatOffers(aggregated.closestMatch.offers)
  )
}

export async function viewPsbt() {
  console.log(
    bitcoin.Psbt.fromBase64(process.env.PSBT_BASE64, {
      network: bitcoin.networks.bitcoin,
    }).data.inputs
  )
}

export async function convertPsbt() {
  const psbt = bitcoin.Psbt.fromHex(process.env.PSBT_HEX, {
    network: bitcoin.networks.bitcoin,
  }).toBase64()
  console.log(psbt)
  console.log(
    bitcoin.Psbt.fromBase64(psbt, {
      network: bitcoin.networks.bitcoin,
    }).data.inputs
  )
}

export async function callAPI(command, data, options = {}) {
  const oylSdk = new Oyl()
  const camelCommand = camelCase(command)
  if (!oylSdk[camelCommand]) throw Error('command not foud: ' + camelCommand)
  const result = await oylSdk[camelCommand](data)
  console.log(JSON.stringify(result, null, 2))
  return result
}

export const MEMPOOL_SPACE_API_V1_URL = 'https://mempool.space/api/v1'

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
  ]
}

const INSCRIPTION_PREPARE_SAT_AMOUNT = 4000

export const RPC_ADDR =
  'https://node.oyl.gg/v1/6e3bc3c289591bb447c116fda149b094'

export const callBTCRPCEndpoint = async (
  method: string,
  params: string | string[]
) => {
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

export async function runCLI() {
  const [command] = yargs.argv._
  const options = Object.assign({}, yargs.argv)
  const tapWallet = new Oyl()
  const mnemonic =
    'rich baby hotel region tape express recipe amazing chunk flavor oven obtain'
  const taprootAddress =
    'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm'
  const segwitAddress = '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic'
  const taprootHdPathWithIndex = TAPROOT_HD_PATH
  const segwitHdPathWithIndex = NESTED_SEGWIT_HD_PATH
  const taprootPubkey =
    '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be'
  const segwitPubkey =
    '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b'

  const psbtsForTaprootAddressEndingDTM = {
    psbtHex:
      '70736274ff0100890200000001578ad7f2a593f9447a8ef0f790a9b1abfc81a6b2796920db573595a6c24c747a0100000000ffffffff02f420000000000000225120a8304c4cab8e15810e0a7d58741b3dcb3520339af31ecf3b264a1f5267cf1cc301100000000000002251200d89d702fafc100ab8eae890cbaf40b3547d6f1429564cf5d5f8d517f4caa390000000000001012b235e0000000000002251200d89d702fafc100ab8eae890cbaf40b3547d6f1429564cf5d5f8d517f4caa390000000',
    psbtBase64:
      'cHNidP8BAIkCAAAAAVeK1/Klk/lEeo7w95Cpsav8gaayeWkg21c1labCTHR6AQAAAAD/////AvQgAAAAAAAAIlEgqDBMTKuOFYEOCn1YdBs9yzUgM5rzHs87JkofUmfPHMMBEAAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAAAAAAABASsjXgAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAAAA',
  }

  // segwitPubKey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
  delete options._
  switch (command) {
    case 'load':
      return await loadRpc(options)
      break
    case 'send':
      const taprootResponse = await tapWallet.sendBtc({
        options: {
          to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
          from: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
          amount: 500,
          feeRate: 100,
          mnemonic,
          publicKey: taprootPubkey,
          segwitAddress,
          segwitHdPath: 'xverse',
          segwitPubkey,
          taprootHdPath: TAPROOT_HD_PATH,
        },
      })

      if (taprootResponse) {
        console.log({ taprootResponse })
      }

      const segwitResponse = await tapWallet.sendBtc({
        options: {
          to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
          from: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
          amount: 500,
          feeRate: 100,
          publicKey: taprootPubkey,
          mnemonic,
          segwitAddress,
          segwitHdPath: 'xverse',
          segwitPubkey,
          taprootHdPath: TAPROOT_HD_PATH,
        },
      })

      if (segwitResponse) {
        console.log({ segwitResponse })
      }

      return
    case 'sendBRC20':
      const test0 = await tapWallet.sendBRC20({
        isDry: true,
        fromAddress:
          'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        taprootPublicKey:
          '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
        destinationAddress:
          'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
        feeRate: 10,
        token: 'BONK',
        segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
        segwitPubKey:
          '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
        mnemonic: mnemonic,
        amount: 40,
        payFeesWithSegwit: true,
        segwitHdPath: 'xverse',
        taprootHdPath: TAPROOT_HD_PATH,
      })
      console.log(test0)
      break
    case 'send-collectible':
      const test1 = await tapWallet.sendOrdCollectible({
        isDry: true,
        fromAddress:
          'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        inscriptionId:
          '68069fc341a462cd9a01ef4808b0bda0db7c0c6ea5dfffdc35b8992450cecb5bi0',
        taprootPublicKey:
          '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
        segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
        segwitPubKey:
          '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
        destinationAddress:
          'bc1pkvt4pj7jgj02s95n6sn56fhgl7t7cfx5mj4dedsqyzast0whpchs7ujd7y',
        feeRate: 10,
        payFeesWithSegwit: false,
        mnemonic:
          'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
        segwitHdPath: 'xverse',
        taprootHdPath: TAPROOT_HD_PATH,
      })
      console.log(test1)
      break
    case 'view':
      return await viewPsbt()
      break
    case 'market':
      return await testMarketplaceBuy()
      break
    case 'convert':
      return await convertPsbt()
      break
    case 'aggregate':
      return await testAggregator()
      break
    case 'ord-test':
      const testCase = await tapWallet.ordRpc.getInscriptionContent(
        '6c51990395726ddbd922a3318b5713bb318da8be6aa199ee79cf9bdb6c91e37ai0'
      )
      console.log(testCase)
      return
      break
    case 'txn-history':
      const test = new Oyl()
      const testLog = await test.getTxHistory({
        addresses: [
          'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
          '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
        ],
      })
      console.log(testLog)
      break
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
