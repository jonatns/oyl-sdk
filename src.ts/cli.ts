import yargs from 'yargs'
import { camelCase } from 'change-case'
import { WalletUtils } from './oylib'
import { Unisat } from 'unisat'

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

export async function getAllTokens() {
  const address = "bc1q3mzwe3thhtjrz7ng7d5jr7ef22safuxyh7nysj";
  const api = new Unisat ({address: address});
  const brcs = await api.addressBrcToken({address});
  const tickerList = brcs["list"];
  let tokens = ["BTC"];
  for (let i = 0; i < tickerList.length; i++){
    tokens.push(tickerList[i]["ticker"])
  }
  console.log(tokens);
  return tokens
}

export async function runCLI() {
  const [command] = yargs.argv._
  const options = Object.assign({}, yargs.argv)
  //console.log("yargs.argv._", yargs.argv._);
  
  delete options._
  switch (command) {
    case 'load':
      return await loadRpc(yargs.argv._[1])
      break
    case 'get':
      return await getAllTokens()
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
