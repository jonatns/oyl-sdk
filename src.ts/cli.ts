import yargs from 'yargs'
import { camelCase } from 'change-case'
import { WalletUtils } from './oylib'
import { getInscriptionsByAddr } from './wallet/bord'

export async function loadRpc(options) {
  const rpcOptions = {}
  rpcOptions['host'] = options.host
  rpcOptions['port'] = options.port
  rpcOptions['network'] = options.network
  rpcOptions['apiKey'] = options.apiKey
  rpcOptions['nodeClient'] = options.nodeClient
  rpcOptions['node'] = options.node
  const rpc = WalletUtils.fromObject(rpcOptions)
  return rpc
}

export async function callAPI(command, data, options = {}) {
  const rpc = await loadRpc(options)
  const camelCommand = camelCase(command)
  //console.log(`${camelCommand}(${data})`);
  if (!rpc[camelCommand]) throw Error('command not foud: ' + command)
  const result = await rpc[camelCommand](data)
  console.log(JSON.stringify(result, null, 2))
  return result
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

export async function runCLI() {
  const [command] = yargs.argv._
  const options = Object.assign({}, yargs.argv)
  
  delete options._
  switch (command) {
    case 'load':
      return await loadRpc(yargs.argv._[1])
      break
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
