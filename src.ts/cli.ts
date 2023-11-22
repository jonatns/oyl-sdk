import yargs from 'yargs'
import { camelCase } from 'change-case'
import { Wallet } from './oylib'
import { PSBTTransaction } from './txbuilder/PSBTTransaction'
import * as transactions from './transactions'
import * as bitcoin from 'bitcoinjs-lib'
import { Inscriber } from '@sadoprotocol/ordit-sdk'
import { BRC_20_TRANSFER_META } from './shared/constants'
import { InscribeTransfer } from './shared/interface'
import "dotenv/config";


export async function loadRpc(options) {
 const wallet = new Wallet()
 try {
  const blockInfo = await wallet.sandshrewBtcClient.bitcoindRpc.getBlock("000000000000000000030f0cd2974e34ffa8edb8824eec8bba01c008105ca0bb");
  console.log('Block Info:', blockInfo);
} catch (error) {
  console.error('Error:', error);
}
}

export async function callAPI(command, data, options = {}) {
  const oylSdk = new Wallet()
  const camelCommand = camelCase(command)
  if (!oylSdk[camelCommand]) throw Error('command not foud: ' + camelCommand)
  const result = await oylSdk[camelCommand](data)
  console.log(JSON.stringify(result, null, 2))
  return result
}

export async function swapFlow() {
  const address = process.env.TAPROOT_ADDRESS
   const feeRate = parseFloat(process.env.FEE_RATE)
   const mnemonic = process.env.TAPROOT_MNEMONIC
  const pubKey = process.env.TAPROOT_PUBKEY

  const psbt = bitcoin.Psbt.fromHex(process.env.PSBT_HEX, {
    network: bitcoin.networks.bitcoin,
  })

  //console.log(psbt)
  const wallet = new Wallet()
  const payload = await wallet.fromPhrase({
    mnemonic: mnemonic.trim(),
    hdPath: process.env.HD_PATH,
    type: process.env.TYPE,
  })

   const keyring = payload.keyring.keyring
   const signer = keyring.signTransaction.bind(keyring)
   const from = address
   const addressType = transactions.getAddressType(from)
   if (addressType == null) throw Error('Invalid Address Type')

   const tx = new PSBTTransaction(signer, from, pubKey, addressType, feeRate)
   const signedPsbt = await tx.signPsbt(psbt)
   //@ts-ignore
   psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false
 
   //EXTRACT THE RAW TX
   //const rawtx = signedPsbt.extractTransaction().toHex()
   //console.log('rawtx', rawtx)
   //BROADCAST THE RAW TX TO THE NETWORK
   //const result = await wallet.apiClient.pushTx({ transactionHex: rawtx })
   //GET THE TX_HASH
   //const ready_txId = psbt.extractTransaction().getId()
   //CONFIRM TRANSACTION IS CONFIRMED
}

async function inscribeTest(options: InscribeTransfer) {
  //WORKFLOW TO INSCRIBE
  //GET & PASS PUBLIC KEY, ADDRESS SENDING FROM, ADDRESS INSCRIPTIOM WILL END UP IN, AND CHANGE ADDRESS
  //PASS THE MEDIA CONTENT (e.g: 'Hello World'), MEDIA TYPE (e.g 'text/plain'), AND META (which will be encoded )
  //PASS feerate and postage (default 1500)
  //Initialize the Inscriber class with these values
  const transaction = new Inscriber({
    network: 'mainnet',
    address: options.feeFromAddress,
    publicKey: options.taprootPublicKey,
    changeAddress: options.feeFromAddress,
    destinationAddress: options.destinationAddress,
    mediaContent: BRC_20_TRANSFER_META.mediaContent,
    mediaType: BRC_20_TRANSFER_META.mediaType,
    feeRate: options.feeRate,
    meta: BRC_20_TRANSFER_META.meta,
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
  //WAIT FOR TRANSACTION TO BE CONFIRMED BEFORE PROCEEDING
  //ONCE THE TX IS CONFIRMED, CHECK IF ITS READY TO BE BUILT
  const ready = await transaction.isReady()
  if (ready) {
    //IF READY, BUILD THE REVEAL TX
    await transaction.build()
    //YOU WILL GET THE PSBT HEX
    const psbtHex = transaction.toHex()
    console.log('transaction: ', psbtHex)
    //PREPARE THE PSBT FOR SIGNING
    const vPsbt = bitcoin.Psbt.fromHex(psbtHex, {
      network: bitcoin.networks.bitcoin,
    })
    //SIGN THE PSBT
    const completeInscription = await signInscriptionPsbt(
      vPsbt,
      options.feeRate,
      options.taprootPublicKey,
      options.signer
    )
    console.log(completeInscription)
  }
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
  const result = await wallet.apiClient.pushTx({ transactionHex: rawtx })
  //GET THE TX_HASH
  const ready_txId = psbt.extractTransaction().getId()
  //CONFIRM TRANSACTION IS CONFIRMED
}

async function recoverTest() {
  const wallet = new Wallet()
  const tx = await wallet.addAccountToWallet({
    mnemonic: process.env.TAPROOT_MNEMONIC,
    activeIndexes: [0],
    customPath: 'unisat',
  })
  console.log(tx)
}

export async function runCLI() {
  const [command] = yargs.argv._
  const options = Object.assign({}, yargs.argv)

  delete options._
  switch (command) {
    case 'load':
      return await loadRpc(options)
      break
    case 'recover':
      return await recoverTest()
      break
    case 'swap':
      return await swapFlow()
      break
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
