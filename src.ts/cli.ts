import yargs from 'yargs'
import { camelCase } from 'change-case'
import { Wallet } from './oylib'
import { PSBTTransaction } from './txbuilder/PSBTTransaction'
import * as transactions from './transactions'
import * as bitcoin from 'bitcoinjs-lib'

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

// export async function getOrdInscription() {
//    const address = "";
//    const inscriptions = await getInscriptionsByAddr(address);
//    let ordInscriptions = [];
//    for (let i = 0; i < inscriptions.length; i++) {
//     const genesisTransaction = inscriptions[i].genesis_transaction;
//     const txhash = genesisTransaction.substring(genesisTransaction.lastIndexOf("/") + 1);

//     if (await checkProtocol(txhash)) {
//       ordInscriptions.push(inscriptions[i]);
//     }
//   }
//   console.log(ordInscriptions.length)
//   return ordInscriptions;
// }

// async function checkProtocol (txhash) {
//   const rpc = await loadRpc({})
//   const rawtx = await rpc.client.execute('getrawtransaction', [ txhash, 0 ]);
//   const decodedTx = await rpc.client.execute('decoderawtransaction', [ rawtx ])
//   const script = bcoin.Script.fromRaw(decodedTx.vin[0].txinwitness[1], "hex")
//   const arr = script.toArray();
//   if (arr[4]?.data?.toString() == "ord"){
//     return true;
//   }
//   return false;
// }

// async function sendTest (){
//   const wallet = new Wallet();
//   const tx = await wallet.sendOrd({
//     mnemonic:  "",
//     to: "",
//     inscriptionId: "",
//     inscriptionOffset: 0,
//     inscriptionOutputValue: 546,
//     fee: 5
//   })
//   return tx;
// }

export async function runCLI() {
  const [command] = yargs.argv._
  const options = Object.assign({}, yargs.argv)

  delete options._
  switch (command) {
    case 'load':
      return await loadRpc(options)
      break
    // case 'send':
    //   return await sendTest()
    //   break
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}

