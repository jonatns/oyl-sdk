import yargs from 'yargs'
import { camelCase } from 'change-case'
import { Oyl } from './oylib'
import { PSBTTransaction } from './txbuilder/PSBTTransaction'
import * as transactions from './transactions'
import * as bitcoin from 'bitcoinjs-lib'
import { address as PsbtAddress } from 'bitcoinjs-lib'
import { ToSignInput } from './shared/interface'
import {
  assertHex,
  createSegwitSigner,
  createTaprootSigner,
} from './shared/utils'
import axios from 'axios'
import * as ecc2 from '@bitcoinerlab/secp256k1'
import { BuildMarketplaceTransaction } from './txbuilder/buildMarketplaceTransaction'

bitcoin.initEccLib(ecc2)

export async function loadRpc(options) {
  const wallet = new Oyl()
  try {
    const blockInfo = await wallet.sandshrewBtcClient.bitcoindRpc.decodePSBT(
      process.env.PSBT_BASE64
    )
    const fees = await wallet.esploraRpc.getAddressUtxo(
      process.env.TAPROOT_ADDRESS
    )
    console.log('Block Info:', blockInfo)
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
    price: 0.0005,
  }
  const intent = new BuildMarketplaceTransaction(options)
  const builder = await intent.psbtBuilder()
  console.log(builder)
}

export async function viewPsbt() {
  console.log(
    bitcoin.Psbt.fromBase64(process.env.PSBT_BASE64, {
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

// async function createOrdPsbtTx() {
//   const wallet = new Oyl()
//   const test0 = await wallet.createOrdPsbtTx({
//     changeAddress: '',
//     fromAddress: '',
//     inscriptionId: '',
//     taprootPubKey: '',
//     segwitAddress: '',
//     segwitPubKey: '',
//     toAddress: '',
//     txFee: 0,
//     mnemonic: '',
//   })
//   console.log(test0)
// }

export async function runCLI() {
  const RequiredPath = [
    "m/44'/0'/0'/0", // P2PKH (Legacy)
    "m/49'/0'/0'/0", // P2SH-P2WPKH (Nested SegWit)
    "m/84'/0'/0'/0", // P2WPKH (SegWit)
    "m/86'/0'/0'/0", // P2TR (Taproot)
  ]
  const [command] = yargs.argv._
  const options = Object.assign({}, yargs.argv)
  const tapWallet = new Oyl()

  const mnemonic =
    'rich baby hotel region tape express recipe amazing chunk flavor oven obtain'

  const taprootSigner = await createTaprootSigner({
    mnemonic: mnemonic,
    taprootAddress:
      'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
    hdPathWithIndex: "m/86'/0'/0'/0/0",
  })
  const segwitSigner = await createSegwitSigner({
    mnemonic: mnemonic,
    segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
    hdPathWithIndex: "m/49'/0'/0'/0/0",
  })

  // segwitPubKey: '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
  delete options._
  switch (command) {
    case 'load':
      return await loadRpc(options)
      break
    case 'send':
      // const taprootResponse = await tapWallet.createBtcTx({
      //   mnemonic: 'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
      //   to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
      //   from: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
      //   amount: 4000,
      //   feeRate: 62,
      //   publicKey:
      //     '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
      // })
      // console.log({ taprootResponse })

      // const segwitResponse = await tapWallet.createBtcTx({
      //   mnemonic: ''
      //   to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
      //   from: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
      //   amount: 4000,
      //   feeRate: 62,
      //   publicKey:
      //     '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
      // })
      // console.log({ segwitResponse })

      return
    case 'test':
      // 'rich baby hotel region tape express recipe amazing chunk flavor oven obtain'

      return await tapWallet.sendBRC20({
        feeFromAddress:
          'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        taprootPublicKey:
          '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
        changeAddress:
          'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        destinationAddress:
          'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
        feeRate: 75,
        token: 'BONK',
        segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
        segwitPubkey:
          '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
        mnemonic: mnemonic,
        amount: 40,
        payFeesWithSegwit: true,
      })

    // async function createOrdPsbtTx() {
    //   const wallet = new Oyl()
    //   const test0 = await wallet.createOrdPsbtTx({
    //     changeAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
    //     fromAddress:
    //       'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
    //     inscriptionId:
    //       '68069fc341a462cd9a01ef4808b0bda0db7c0c6ea5dfffdc35b8992450cecb5bi0',
    //     taprootPubKey:
    //       '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
    //     segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
    //     segwitPubKey:
    //       '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
    //     toAddress:
    //       'bc1pkvt4pj7jgj02s95n6sn56fhgl7t7cfx5mj4dedsqyzast0whpchs7ujd7y',
    //     txFee: 68,
    //     payFeesWithSegwit: true,
    //     mnemonic:
    //       'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
    //   })
    //   console.log(test0)
    // }
    // await createOrdPsbtTx()
    // break
    case 'view':
      return await viewPsbt()
      break
    case 'market':
      return await testMarketplaceBuy()
      break
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
