import yargs from 'yargs'
import { camelCase } from 'change-case'
import 'dotenv/config'
import { NESTED_SEGWIT_HD_PATH, Oyl, TAPROOT_HD_PATH } from './oylib'
import { Aggregator } from './PSBTAggregator'
import * as bitcoin from 'bitcoinjs-lib'
import axios from 'axios'
import * as ecc2 from '@bitcoinerlab/secp256k1'
import { Marketplace } from './marketplace'
import { Network } from './shared/interface'
import { getAddressType } from './transactions'

bitcoin.initEccLib(ecc2)

export async function loadRpc() {
  const initOptions = {
    baseUrl: 'https://testnet.sandshrew.io',
    version: 'v1',
    projectId: 'd6aebfed1769128379aca7d215f0b689', // default API key
    network: 'testnet' as Network,
  }
  const wallet = new Oyl(initOptions)
  try {
    const addressType = getAddressType(process.env.TESTNET_TAPROOT_ADDRESS)
    const newWallet = await wallet.fromPhrase({
      mnemonic: process.env.TESTNET_TAPROOT_MNEMONIC.trim(),
      hdPath: process.env.TESTNET_TAPROOT_HDPATH,
      addrType: addressType
    })
    console.log('newWallet:', JSON.stringify(newWallet))
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function testMarketplaceBuy() {
  const initOptions = {
    baseUrl: 'https://testnet.sandshrew.io',
    version: 'v1',
    projectId: 'd6aebfed1769128379aca7d215f0b689', // default API key
    network: 'testnet' as Network,
  }
  const wallet = new Oyl(initOptions)

  const marketplaceOptions = {
    address: process.env.TESTNET_TAPROOT_ADDRESS,
    publicKey: process.env.TESTNET_TAPROOT_PUBKEY,
    mnemonic: process.env.TESTNET_TAPROOT_MNEMONIC,
    feeRate: parseFloat(process.env.FEE_RATE),
    wallet: wallet
  }

  const quotes =[
    {
    offerId: "658217b8eff2a5b8b8f74413",
    marketplace: "omnisat",
    ticker: "piza"
  },
  {
    offerId: "658217e4aa74d8b8c6d755d1",
    marketplace: "omnisat",
    ticker: "piza"
  },
]
  const marketplace = new Marketplace(marketplaceOptions)
  const offersToBuy = await marketplace.processAllOffers(quotes)
  const signedTxs = await marketplace.buyMarketPlaceOffers(offersToBuy)
  console.log(signedTxs);
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
  const tapWallet = new Oyl({
    network: 'mainnet',
    baseUrl: 'https://mainnet.sandshrew.io',
    version: 'v1',
    projectId: 'd6aebfed1769128379aca7d215f0b689',
  })
  const mnemonic =
    'rich baby hotel region tape express recipe amazing chunk flavor oven obtain'
  const taprootAddress =
    'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm'
  const segwitAddress = '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic'
  const taprootHdPath = TAPROOT_HD_PATH
  const segwitHdPath = NESTED_SEGWIT_HD_PATH
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

  const testWallet = new Oyl({
    network: 'testnet',
    baseUrl: 'https://testnet.sandshrew.io',
    version: 'v1',
    projectId: 'd6aebfed1769128379aca7d215f0b689',
  })

  const testnetMnemonic =
    'upgrade float mixed life shy bread ramp room artist road major purity'

  const testnetSegwitPubKey =
    '02a4a49b8efd123ecc2fb200a95d4da40dac7abd563cfb52b8aa245cbca0249c1c'
  const testnetSegwitAddress = 'tb1qsvuaztq2jltrl5pq26njcmn4gdz250325edas2'

  const testnetTaprootPubKey =
    '036cbe3e4c6ece9e96ae7dabc99cfd3d9ffb3fcefc98d72e64cfc2a615ef9b8c9a'
  const testnetTaprootAddress =
    'tb1phq6q90tnfq9xjlqf3zskeeuknsvhg954phrm6fkje7ezfrmkms7q0z4e26'
  switch (command) {
    case 'load':
      return await loadRpc()
      break
    case 'send':
      const taprootResponse = await tapWallet.sendBtc({
        to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
        from: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        amount: 500,
        feeRate: 25,
        mnemonic,
        publicKey: taprootPubkey,
        segwitAddress,
        segwitHdPath: 'xverse',
        segwitPubkey,
      })

      if (taprootResponse) {
        console.log({ taprootResponse })
      }

      const segwitResponse = await tapWallet.sendBtc({
        to: 'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
        from: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
        amount: 500,
        feeRate: 25,
        publicKey: taprootPubkey,
        mnemonic,
        segwitAddress,
        segwitHdPath: 'xverse',
        segwitPubkey,
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
        payFeesWithSegwit: true,
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
    // case 'market':
    //   return await testMarketplaceBuy()
    //   break
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
    case 'testnet-send':
      await testWallet.recoverWallet({
        mnemonic: testnetMnemonic,
        activeIndexes: [0],
        customPath: 'testnet',
      })

      const testnetTaprootResponse = await testWallet.sendBtc({
        to: 'tb1p6l2wm54y9rh6lz3gd4z2ty8w4nftnav7g4fph399f8zy4ed6h9cskmg3le',
        from: testnetTaprootAddress,
        amount: 500,
        feeRate: 10,
        mnemonic: testnetMnemonic,
        publicKey: testnetTaprootPubKey,
        segwitAddress: testnetSegwitAddress,
        segwitHdPath: 'testnet',
        segwitPubkey:
          '02f12478ea8f28d179245d095faf1e14d63b9465d1a5fe2d5e0a107559082f887a',
      })

      if (testnetTaprootResponse) {
        console.log({ testnetTaprootResponse })
      }

      const testnetSegwitResponse = await testWallet.sendBtc({
        to: 'tb1qgqw2l0hqglzw020h0yfjv69tuz50aq9m99h632',
        from: testnetSegwitAddress,
        amount: 500,
        feeRate: 100,
        mnemonic: testnetMnemonic,
        publicKey: testnetTaprootPubKey,
        segwitAddress: testnetSegwitAddress,
        segwitHdPath: 'testnet',
        segwitPubkey:
          '02f12478ea8f28d179245d095faf1e14d63b9465d1a5fe2d5e0a107559082f887a',
      })

      if (testnetSegwitResponse) {
        console.log({ testnetSegwitResponse })
      }
      return
    case 'gen-testnet-wallet':
      const genTestWallet = await testWallet.initializeWallet()

      console.log({
        mnemonic: genTestWallet.mnemonic,
        segwit: {
          address: genTestWallet.segwit.segwitAddresses[0],
          publicKey:
            genTestWallet.segwit.segwitKeyring.wallets[0].publicKey.toString(
              'hex'
            ),
          privateKey:
            genTestWallet.segwit.segwitKeyring.wallets[0].privateKey.toString(
              'hex'
            ),
          signer: genTestWallet.segwit.segwitKeyring.signTransaction.bind(
            genTestWallet.segwit.segwitKeyring
          ),
        },
        taproot: {
          address: genTestWallet.taproot.taprootAddresses[0],
          publicKey:
            genTestWallet.taproot.taprootKeyring.wallets[0].publicKey.toString(
              'hex'
            ),
          privateKey:
            genTestWallet.taproot.taprootKeyring.wallets[0].privateKey.toString(
              'hex'
            ),
          signer: genTestWallet.taproot.taprootKeyring.signTransaction.bind(
            genTestWallet.taproot.taprootKeyring
          ),
        },
      })
      return
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
