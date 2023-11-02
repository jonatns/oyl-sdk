import yargs from 'yargs'
import { camelCase } from 'change-case'
import { Wallet } from './oylib'
import { PSBTTransaction } from './txbuilder/PSBTTransaction'
import * as transactions from './transactions'
import * as bitcoin from 'bitcoinjs-lib'
import { Inscriber } from "@sadoprotocol/ordit-sdk"

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

async function inscribeTest () {
   // new inscription tx
   const transaction = new Inscriber({
    network: "mainnet",
    address: "bc1p2hq8sx32n8993teqgcgrndw4qege6shjkcewgwpudqkqelgmw4ksmv4hud",
    publicKey: "03223e9553641f278d14dff04a90fa14eedc3789279804832a7e01db3317c7e92d",
    changeAddress: "bc1p2hq8sx32n8993teqgcgrndw4qege6shjkcewgwpudqkqelgmw4ksmv4hud",
    destinationAddress: "bc1p2hq8sx32n8993teqgcgrndw4qege6shjkcewgwpudqkqelgmw4ksmv4hud",
    mediaContent: 'Hello World',
    mediaType: "text/plain",
    feeRate: 3,
    meta: { // Flexible object: Record<string, any>
      title: "Example title",
      desc: "Lorem ipsum",
      slug: "cool-digital-artifact",
      creator: {
        name: "Your Name",
        email: "artist@example.org",
        address: "bc1p2hq8sx32n8993teqgcgrndw4qege6shjkcewgwpudqkqelgmw4ksmv4hud"
      }
    },
    postage: 1500 // base value of the inscription in sats
  })

  const revealed = await transaction.generateCommit();
  console.log("Revealed: ", revealed)
  const wallet = new Wallet()
  const depositRevealFee = await wallet.sendBtc({
    mnemonic: 'great move degree abstract scatter become lab walnut infant evoke quick impose',
    to: revealed.address,
    amount: revealed.revealFee / 100000000,
    fee: 5,
  })
  console.log("deposit reveal fee", depositRevealFee)
  const ready = await transaction.isReady();
  if (ready) {
    await transaction.build();
    console.log("transaction: ", transaction.toHex())
}
}

async function recoverTest() {
  const wallet = new Wallet()
  const tx = await wallet.addAccountToWallet({
    mnemonic: 'great move degree abstract scatter become lab walnut infant evoke quick impose',
    activeIndexes: [0],
    customPath: 'xverse',
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
      return await inscribeTest()
      break
    default:
      return await callAPI(yargs.argv._[0], options)
      break
  }
}
