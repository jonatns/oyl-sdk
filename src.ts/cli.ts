import yargs from 'yargs'
import { camelCase } from 'change-case'
import { Wallet } from './oylib'
import { PSBTTransaction } from './txbuilder/PSBTTransaction'
import * as transactions from './transactions'
import * as bitcoin from 'bitcoinjs-lib'
import { Inscriber } from '@sadoprotocol/ordit-sdk'
import { getBrc20Data } from './shared/constants'
import { InscribeTransfer } from './shared/interface'
import { calculateAmountGathered, getUTXOsToCoverAmount } from './shared/utils'

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

async function inscribeTest(options: InscribeTransfer) {
  //WORKFLOW TO INSCRIBE
  //GET & PASS PUBLIC KEY, ADDRESS SENDING FROM, ADDRESS INSCRIPTIOM WILL END UP IN, AND CHANGE ADDRESS
  //PASS THE MEDIA CONTENT (e.g: 'Hello World'), MEDIA TYPE (e.g 'text/plain'), AND META (which will be encoded )
  //PASS feerate and postage (default 1500)
  //Initialize the Inscriber class with these values
  const brc20TransferMeta = getBrc20Data({
    tick: options.token,
    amount: options.amount,
  })
  const transaction = new Inscriber({
    network: 'mainnet',
    address: options.feeFromAddress,
    publicKey: options.taprootPublicKey,
    changeAddress: options.feeFromAddress,
    destinationAddress: options.destinationAddress,
    mediaContent: brc20TransferMeta.mediaContent,
    mediaType: brc20TransferMeta.mediaType,
    feeRate: options.feeRate,
    postage: options?.postage || 1500, // base value of the inscription in sats
  })
  //GENERATE COMMIT PAYMENT REQUEST - THIS DUMPS AN ADDRESS FROM THE PUBKEY & TOTAL COST FOR INSCRIPTION
  const revealed = await transaction.generateCommit()
  //SEND BITCOIN FROM REGULAR ADDRESS TO THE DUMPED ADDRESS
  const wallet = new Wallet()
  const depositRevealFee = await wallet.createPsbtTx({
    publicKey: options.taprootPublicKey,
    from: options.feeFromAddress,
    to: revealed.address,
    changeAddress: options.feeFromAddress,
    amount: (revealed.revealFee / 100000000).toString(),
    fee: options.feeRate,
    signer: options.signer,
  })
  console.log('deposit reveal fee', depositRevealFee)
  //COLLECT_TX_HASH
  const tx_hash = depositRevealFee.txId
  console.log({ tx_hash })
  //WAIT FOR TRANSACTION TO BE CONFIRMED BEFORE PROCEEDING
  //ONCE THE TX IS CONFIRMED, CHECK IF ITS READY TO BE BUILT
  // const ready = await transaction.isReady()
  //IF READY, BUILD THE REVEAL TX
  await transaction.isReady({ skipStrictSatsCheck: true })
  await transaction.build()
  //YOU WILL GET THE PSBT HEX
  const psbtHex = transaction.toHex()
  console.log('transaction: ', psbtHex)
  //PREPARE THE PSBT FOR SIGNING
  const vPsbt = bitcoin.Psbt.fromHex(psbtHex, {
    network: bitcoin.networks.bitcoin,
  })
  //SIGN THE PSBT

  const txnId: string = await signInscriptionPsbt(
    vPsbt,
    options.feeRate,
    options.taprootPublicKey,
    options.signer,
    options.feeFromAddress
  )
  console.log({ txnId })

  const psbt = new bitcoin.Psbt()
  let reimbursementAmount = 0
  psbt.addInput({
    hash: txnId,
    index: 0,
    witnessUtxo: {
      value: 546,
      script: Buffer.from(options.taprootPublicKey, 'hex'),
    },
  })

  console.log(psbt.inputCount)
  const vB = psbt.inputCount * 149 + 3 * 32 + 12
  const fee = vB * options.feeRate
  const utxosGathered = await getUTXOsToCoverAmount(options.feeFromAddress, fee)
  const amountGathered = calculateAmountGathered(utxosGathered)
  if (amountGathered === 0) {
    throw Error('INSUFFICIENT_FUNDS_FOR_INSCRIBE')
  }

  reimbursementAmount = amountGathered - fee
  if (reimbursementAmount < 0) {
    throw Error('FEES_LESS_THEN_GATHERED')
  }

  for (let utxo of utxosGathered) {
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
    value: 4000,
    address: String(bitcoin.address), // address for inscriber for the user
  })

  if (reimbursementAmount > 546) {
    psbt.addOutput({
      value: reimbursementAmount,
      address: options.feeFromAddress,
    })
  }
  psbt.signAllInputs(options.signer)
  psbt.finalizeAllInputs()

  const rawtx = psbt.extractTransaction().toHex()
  console.log('rawtx', rawtx)
  //BROADCAST THE RAW TX TO THE NETWORK
  await wallet.apiClient.pushTx({ transactionHex: rawtx })
  //GET THE TX_HASH
  const ready_txId = psbt.extractTransaction().getId()
  console.log('ready_tx', ready_txId)
  return ready_txId
}

async function signInscriptionPsbt(psbt, fee, pubKey, signer, address = '') {
  //INITIALIZE NEW PSBTTransaction INSTANCE
  const wallet = new Wallet()
  const addressType = transactions.getAddressType(address)
  if (addressType == null) throw Error('Invalid Address Type')
  const tx = new PSBTTransaction(signer, address, pubKey, addressType, fee)

  //SIGN AND FINALIZE THE PSBT
  const signedPsbt = await tx.signPsbt(psbt, true, true)
  //@ts-ignore
  psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false

  //EXTRACT THE RAW TX
  const rawtx = signedPsbt.extractTransaction().toHex()
  console.log('rawtx', rawtx)
  //BROADCAST THE RAW TX TO THE NETWORK
  await wallet.apiClient.pushTx({ transactionHex: rawtx })
  //GET THE TX_HASH
  const ready_txId = psbt.extractTransaction().getId()

  return ready_txId
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
        'rich baby hotel region tape express recipe amazing chunk flavor oven obtain'
      const tapWallet = new Wallet()
      const tapPayload = await tapWallet.fromPhrase({
        mnemonic: mnemonic.trim(),
        hdPath: RequiredPath[3],
        type: 'taproot',
      })
      const signer = tapPayload.keyring.keyring
      const tapSigner = signer.signTransaction.bind(signer)

      return await inscribeTest({
        feeFromAddress:
          'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        taprootPublicKey:
          '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
        changeAddress:
          'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        destinationAddress:
          'bc1p5pvvfjtnhl32llttswchrtyd9mdzd3p7yps98tlydh2dm6zj6gqsfkmcnd',
        feeRate: 100,
        token: 'HODL',
        signer: tapSigner,
        amount: 100,
      })

      async function createOrdPsbtTx() {
        const wallet = new Wallet()
        const test0 = await wallet.createOrdPsbtTx({
          changeAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
          fromAddress:
            'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
          inscriptionId:
            '17b5fa0de0a753b4dd3140039a3c61ea213ea5dddbfafcb79dfd63d731e1aff2i0',
          taprootPubKey:
            '02ebb592b5f1a2450766487d451f3a6fb2a584703ef64c6acb613db62797f943be',
          segwitAddress: '3By5YxrxR7eE32ANZSA1Cw45Bf7f68nDic',
          segwitPubKey:
            '03ad1e146771ae624b49b463560766f5950a9341964a936ae6bf1627fda8d3b83b',
          toAddress:
            'bc1pjrpg3nxzkx6pqfykcw6w5das4nzz78xq23ejtl4xpfxt7xeh0jwq2ywzlz',
          txFee: 68,
          mnemonic:
            'rich baby hotel region tape express recipe amazing chunk flavor oven obtain',
        })
        console.log(test0)
      }
      break
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
