import yargs from 'yargs'
import { camelCase } from 'change-case'
import { Wallet } from './oylib'
import { PSBTTransaction } from './txbuilder/PSBTTransaction'
import * as transactions from './transactions'
import * as bitcoin from 'bitcoinjs-lib'
import { address as PsbtAddress, Psbt, PsbtTxOutput } from 'bitcoinjs-lib'
import { getBrc20Data } from './shared/constants'
import { InscribeTransfer, ToSignInput } from './shared/interface'
import {
  assertHex,
  calculateAmountGathered,
  delay,
  getScriptForAddress,
  getUTXOsToCoverAmount,
  tweakSigner,
} from './shared/utils'
import axios from 'axios'

import * as ecc from '@cmdcode/crypto-utils'
import { Address, Signer, Tap, Tx, TxData } from '@cmdcode/tapscript'
import * as ecc2 from '@bitcoinerlab/secp256k1'
import * as bip39 from 'bip39'
import BIP32Factory from 'bip32'
import { toXOnly } from '@sadoprotocol/ordit-sdk'
const bip32 = BIP32Factory(ecc2)
bitcoin.initEccLib(ecc2)

export async function loadRpc(options) {
  const rpcOptions = {
    host: options.host,
    port: options.port,
    network: options.network,
    auth: options.apiKey,
  }
  const wallet = new Wallet()
  const rpc = wallet.fromProvider(rpcOptions)
  return rpc
}

export async function callAPI(command, data, options = {}) {
  const oylSdk = new Wallet()
  const camelCommand = camelCase(command)
  if (!oylSdk[camelCommand]) throw Error('command not foud: ' + camelCommand)
  const result = await oylSdk[camelCommand](data)
  console.log(JSON.stringify(result, null, 2))
  return result
}

export async function swapFlow(options) {
  const address = options.address
  const feeRate = options.feeRate
  const mnemonic = options.mnemonic
  const pubKey = options.pubKey

  const psbt = bitcoin.Psbt.fromHex(options.psbt, {
    network: bitcoin.networks.bitcoin,
  })
  const wallet = new Wallet()
  const payload = await wallet.fromPhrase({
    mnemonic: mnemonic.trim(),
    hdPath: options.hdPath,
    type: options.type,
  })

  const keyring = payload.keyring.keyring
  const signer = keyring.signTransaction.bind(keyring)
  const from = address
  const addressType = transactions.getAddressType(from)
  if (addressType == null) throw Error('Invalid Address Type')

  const tx = new PSBTTransaction(signer, from, pubKey, addressType, feeRate)

  const psbt_ = await tx.signPsbt(psbt)

  return psbt_.toHex()
}

const formatOptionsToSignInputs = async (
  _psbt: string | bitcoin.Psbt,
  isRevealTx: boolean = false,
  pubkey: string,
  tapAddress: string
) => {
  let toSignInputs: ToSignInput[] = []
  const psbtNetwork = bitcoin.networks.bitcoin

  const psbt =
    typeof _psbt === 'string'
      ? bitcoin.Psbt.fromHex(_psbt as string, { network: psbtNetwork })
      : (_psbt as bitcoin.Psbt)

  psbt.data.inputs.forEach((v, index: number) => {
    let script: any = null
    let value = 0
    const tapInternalKey = assertHex(Buffer.from(pubkey, 'hex'))
    const p2tr = bitcoin.payments.p2tr({
      internalPubkey: tapInternalKey,
      network: bitcoin.networks.bitcoin,
    })
    if (v.witnessUtxo?.script.toString('hex') == p2tr.output?.toString('hex')) {
      v.tapInternalKey = tapInternalKey
    }
    if (v.witnessUtxo) {
      script = v.witnessUtxo.script
      value = v.witnessUtxo.value
    } else if (v.nonWitnessUtxo) {
      const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo)
      const output = tx.outs[psbt.txInputs[index].index]
      script = output.script
      value = output.value
    }
    const isSigned = v.finalScriptSig || v.finalScriptWitness
    if (script && !isSigned) {
      console.log('not signed')
      const address = PsbtAddress.fromOutputScript(script, psbtNetwork)
      if (isRevealTx || tapAddress === address) {
        console.log('entered', index)
        if (v.tapInternalKey) {
          console.log('hasTapInternal')
          toSignInputs.push({
            index: index,
            publicKey: pubkey,
            sighashTypes: v.sighashType ? [v.sighashType] : undefined,
          })
        }
      }
      // else {
      //   toSignInputs.push({
      //     index: index,
      //     publicKey: this.segwitPubKey,
      //     sighashTypes: v.sighashType ? [v.sighashType] : undefined,
      //   })
      // }
    }
  })

  return toSignInputs
}

export const MEMPOOL_SPACE_API_V1_URL = 'https://mempool.space/api/v1'

const getRecommendedBTCFeesMempool = async () => {
  const gen_res = await axios
    .get(`${MEMPOOL_SPACE_API_V1_URL}/fees/recommended`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.data)

  return await gen_res
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
  ]
}

const INSCRIPTION_PREPARE_SAT_AMOUNT = 4000

export const RPC_ADDR =
  'https://node.oyl.gg/v1/6e3bc3c289591bb447c116fda149b094'

export const callBTCRPCEndpoint = async (method: string, params: string) => {
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

export const inscribe = async ({
  ticker,
  amount,
  inputAddress,
  outputAddress,
  commitTxId,
  isDry,
}: {
  ticker: string
  amount: number
  inputAddress: string
  outputAddress: string
  commitTxId?: string
  isDry?: boolean
}) => {
  const { fastestFee } = await getRecommendedBTCFeesMempool()
  const inputs = 1
  const vB = inputs * 149 + 3 * 32 + 12
  const minerFee = vB * fastestFee
  const fees = minerFee + 4000

  try {
    console.log('TRYING')
    const secret =
      'd84d671cbd24a08db5ed43b93102484bd9bd8beb657e784451a226cf6a6e259b'

    const secKey = ecc.keys.get_seckey(String(secret))
    const pubKey = ecc.keys.get_pubkey(String(secret), true)

    console.log('GOT THINGS')

    const content = `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amount}"}`

    const script = createInscriptionScript(pubKey, content)
    const tapleaf = Tap.encodeScript(script)
    const [tpubkey, cblock] = Tap.getPubKey(pubKey, { target: tapleaf })
    const address = Address.p2tr.fromPubKey(tpubkey)

    if (!commitTxId) {
      console.log('NO COMMIT TX ID')
      let reimbursementAmount = 0
      const psbt = new bitcoin.Psbt()
      const utxosGathered = await getUTXOsToCoverAmount(inputAddress, fees)
      const amountGathered = calculateAmountGathered(utxosGathered)
      if (amountGathered === 0) {
        console.log('WAHAHAHAHAH')
        return { error: 'insuffICIENT funds for inscribe' }
      }

      reimbursementAmount = amountGathered - fees

      for await (let utxo of utxosGathered) {
        const {
          tx_hash_big_endian,
          tx_output_n,
          value,
          script: outputScript,
        } = utxo

        psbt.addInput({
          hash: tx_hash_big_endian,
          index: tx_output_n,
          witnessUtxo: { value, script: Buffer.from(outputScript, 'hex') },
        })
      }

      psbt.addOutput({
        value: INSCRIPTION_PREPARE_SAT_AMOUNT,
        address: address, // address for inscriber for the user
      })

      if (reimbursementAmount > 546) {
        psbt.addOutput({
          value: reimbursementAmount,
          address: inputAddress,
        })
      }

      return {
        psbtHex: psbt.toHex(),
        psbtBase64: psbt.toBase64(),
      }
    }

    console.log('CREATING TX', commitTxId)

    const txData = Tx.create({
      vin: [
        {
          txid: commitTxId,
          vout: 0,
          prevout: {
            value: INSCRIPTION_PREPARE_SAT_AMOUNT,
            scriptPubKey: ['OP_1', tpubkey],
          },
        },
      ],
      vout: [
        {
          value: 546,
          scriptPubKey: Address.toScriptPubKey(outputAddress),
        },
      ],
    })

    const sig = Signer.taproot.sign(secKey, txData, 0, { extension: tapleaf })
    txData.vin[0].witness = [sig, script, cblock]

    console.log('ADDED WITNESSES')

    console.log('TX DATA', Tx.encode(txData).hex)

    if (!isDry) {
      const rpcResponse = await callBTCRPCEndpoint(
        'sendrawtransaction',
        Tx.encode(txData).hex
      )
      console.log({ rpcResponse })
      if (!rpcResponse.result) {
        console.log('CALLING AGAIN!!!!!!!!')
        await delay(10000)
        return inscribe({
          ticker,
          amount,
          inputAddress,
          outputAddress,
          commitTxId,
        })
      }
      return rpcResponse
    } else {
      return { revealTxId: Tx.util.getTxid(txData) }
    }
  } catch (e: any) {
    // console.error(e);
    return { error: e.message }
  }
}

async function inscribeTest(options: InscribeTransfer) {
  try {
    const brc20TransferMeta = getBrc20Data({
      tick: options.token,
      amount: options.amount,
    })
    console.log({ brc20TransferMeta })

    // START CREATING TRANSFER INSCRIPTION
    const { psbtHex: commitTxHex } = await inscribe({
      ticker: options.token,
      amount: options.amount,
      inputAddress: options.feeFromAddress,
      outputAddress: options.feeFromAddress,
      isDry: false,
    })

    const commitTx = bitcoin.Psbt.fromHex(commitTxHex)

    console.log({ commitTxHex })
    console.log({ commitBase64: commitTx.toBase64() })
    // TODO: NEED TO SIGN HERE

    // console.log('signing all inputs')
    // console.log(options.signer)
    // console.log('input count', commitTx.inputCount)
    // await commitTx.signAllInputsAsync(options.signer)
    // console.log('finalizing')
    // commitTx.finalizeAllInputs()

    // const commitTxId = commitTx.extractTransaction().toHex()

    const rpcResponse = await callBTCRPCEndpoint(
      'sendrawtransaction',
      Tx.encode(commitTxHex).hex
    )

    console.log({ rpcResponse })
    // console.log({ commitTxId })
    return

    // console.log({ commitTxHex })
    // return

    // console.log('waiting for 10 seconds')
    // await delay(10000)

    // const commitTxId =
    //   '1bba54c7afa9506a9291461c3219b959051fa8a83d46006150bf803b4dcae932'
    //
    // const result = await inscribe({
    //   ticker: options.token,
    //   amount: options.amount,
    //   inputAddress: options.feeFromAddress,
    //   outputAddress: options.feeFromAddress,
    //   isDry: false,
    //   commitTxId,
    // })

    // const revealTxId =
    //   'aaf3e91effa9380df4d4967b031c6331b4ab4a32705bcba05add25748e369b47'

    // console.log('result', result)

    //
    // // FINISHED CREATING TRANSFER INSCRIPTION
    //
    // // START CREATING PSBT TO SEND TO RECIPIENT
    // const sendTransferPsbt = new bitcoin.Psbt()
    // let reimbursementAmount = 0
    // const script = await getScriptForAddress(options.feeFromAddress)
    // // const transferInscriptionOutput = vPsbt.txOutputs[0] as PsbtTxOutput
    //
    // // console.log({ transferInscriptionOutput })
    //
    // sendTransferPsbt.addInput({
    //   hash: revealTxId as string,
    //   index: 0,
    //   witnessUtxo: {
    //     value: 546,
    //     script: Buffer.from(script, 'hex'),
    //   },
    // })
    //
    // sendTransferPsbt.addOutput({
    //   value: 546,
    //   address: options.destinationAddress,
    // })
    //
    // const vB = sendTransferPsbt.inputCount * 149 + 3 * 32 + 12
    // const fee = vB * options.feeRate
    //
    // const utxosGatheredForFees = await getUTXOsToCoverAmount(
    //   options.feeFromAddress,
    //   fee
    // )
    // const amountGathered = calculateAmountGathered(utxosGatheredForFees)
    // if (amountGathered === 0 || utxosGatheredForFees.length === 0) {
    //   new Error('INSUFFICIENT_FUNDS_FOR_INSCRIBE')
    // }
    //
    // reimbursementAmount = amountGathered - fee
    // if (reimbursementAmount < 0) {
    //   new Error('FEES_LESS_THEN_GATHERED')
    // }
    //
    // for (let utxo of utxosGatheredForFees) {
    //   const {
    //     tx_hash_big_endian,
    //     tx_output_n,
    //     value,
    //     script: outputScript,
    //   } = utxo
    //
    //   sendTransferPsbt.addInput({
    //     hash: tx_hash_big_endian,
    //     index: tx_output_n,
    //     witnessUtxo: { value, script: Buffer.from(outputScript, 'hex') },
    //   })
    // }
    //
    // sendTransferPsbt.addOutput({
    //   value: reimbursementAmount,
    //   address: options.feeFromAddress, // address for inscriber for the user
    // })
    //
    // console.log(sendTransferPsbt.toHex())

    // const toSignInputs: ToSignInput[] = await formatOptionsToSignInputs(
    //   sendTransferPsbt,
    //   false,
    //   options.taprootPublicKey,
    //   options.feeFromAddress
    // )

    // console.log(sendTransferPsbt.toBase64())
    // await options.signer(sendTransferPsbt, toSignInputs)
    // sendTransferPsbt.finalizeAllInputs()
    // const rawTx = sendTransferPsbt.extractTransaction().toHex()
    // console.log({ rawTx })
    // await wallet.apiClient.pushTx({ transactionHex: rawTx })
    // return sendTransferPsbt.extractTransaction().getId()
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err)
      return Error(`Things exploded (${err.message})`)
    }
    console.error(err)
    return err
  }
}

async function signAndBroadcastInscriptionPsbt(
  psbt: Psbt,
  fee: number,
  pubKey: string,
  signer,
  address = '',
  isDry: boolean = false
): Promise<string | Error | unknown> {
  try {
    const wallet = new Wallet()
    const addressType = transactions.getAddressType(address)
    if (addressType == null) new Error('Invalid Address Type')
    const tx = new PSBTTransaction(signer, address, pubKey, addressType, fee)
    const signedPsbt = await tx.signPsbt(psbt, true, true)
    //@ts-ignore
    psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false
    const rawtx = signedPsbt.extractTransaction().toHex()
    console.log('signAndBroadcastInscriptionPsbt() rawTx:', rawtx)
    if (!isDry) {
      await wallet.apiClient.pushTx({ transactionHex: rawtx })
    }

    return psbt.extractTransaction().getId()
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Error(`Things exploded (${err.message})`)
    }
    return err
  }
}

async function createOrdPsbtTx() {
  const wallet = new Wallet()
  const test0 = await wallet.createOrdPsbtTx({
    changeAddress: '',
    fromAddress: '',
    inscriptionId: '',
    taprootPubKey: '',
    segwitAddress: '',
    segwitPubKey: '',
    toAddress: '',
    txFee: 0,
    mnemonic: '',
  })
  console.log(test0)
}

export async function runCLI() {
  const RequiredPath = [
    "m/44'/0'/0'/0", // P2PKH (Legacy)
    "m/49'/0'/0'/0", // P2SH-P2WPKH (Nested SegWit)
    "m/84'/0'/0'/0", // P2WPKH (SegWit)
    "m/86'/0'/0'/0", // P2TR (Taproot)
  ]
  const [command] = yargs.argv._
  const options = Object.assign({}, yargs.argv)

  delete options._
  switch (command) {
    case 'load':
      return await loadRpc(options)
      break
    case 'test':
      const mnemonic =
        'speak sustain unfold umbrella lobster sword style kingdom notable agree supply come'
      const tapWallet = new Wallet()
      const tapPayload = await tapWallet.fromPhrase({
        mnemonic: mnemonic.trim(),
        hdPath: RequiredPath[3],
        type: 'taproot',
      })
      const signer = tapPayload.keyring.keyring
      const tapSigner = signer.signTransaction.bind(signer)

      const mcndSeedFromMnemonic = await bip39.mnemonicToSeed(String(mnemonic))
      const internalKey = bip32
        .fromSeed(mcndSeedFromMnemonic)
        .derivePath("m/86'/0'/0'/0/0")
      const leafKey = bip32
        .fromSeed(mcndSeedFromMnemonic)
        .derivePath("m/86'/0'/0'/0/1")

      const xOnlyInternalPubkey = toXOnly(internalKey.publicKey)
      const xOnlyLeafPubkey = toXOnly(leafKey.publicKey)

      const tweakedChildNode = internalKey.tweak(
        bitcoin.crypto.taggedHash('TapTweak', internalKey.publicKey!)
      )

      const tweakedSigner = tweakSigner(internalKey!)

      console.log({ xOnlyInternalPubkey: xOnlyInternalPubkey.toString('hex') })

      return await inscribeTest({
        feeFromAddress:
          'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
        taprootPublicKey:
          '02859513d2338a02f032e55c57c10f418f9b727f9e9f3dc8d8bf90238e61699018',
        changeAddress:
          'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
        destinationAddress:
          'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        feeRate: 75,
        token: 'BONK',
        signer: internalKey,
        amount: 10,
      })

      // async function createOrdPsbtTx() {
      //   const wallet = new Wallet()
      //   const test0 = await wallet.createOrdPsbtTx({
      //     changeAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
      //     fromAddress:
      //       'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
      //     inscriptionId:
      //       '275d099a2244bee278d451859a74918e7422d20627245c31c86e154a03f0ded7i0',
      //     taprootPubKey:
      //       '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
      //     segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
      //     segwitPubKey:
      //       '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
      //     toAddress:
      //       'bc1pkvt4pj7jgj02s95n6sn56fhgl7t7cfx5mj4dedsqyzast0whpchs7ujd7y',
      //     txFee: 68,
      //     mnemonic:
      //       'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
      //   })
      //   console.log(test0)
      // }
      // const resp = await createOrdPsbtTx()
      // return resp
      break
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
