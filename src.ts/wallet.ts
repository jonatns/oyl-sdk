import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import bip32utils from 'bip32-utils';
import requireGlobal from '../scripts'
const bcoin = requireGlobal("bcoin");

const bip32 = BIP32Factory(ecc);

const network = bcoin.Network.get('testnet')
const client = new bcoin.NodeClient({
  network: 'testnet',
  apiKey: 'YOUR_API_KEY'
})


const walletOptions = {
  network: network.type,
  port: network.walletPort,
  apiKey: 'api-key'
}

/**
 * Options
 * 
 * id='primary'
  passphrase='secret123'
  name='menace'
  type='multisig'

 */

const derivationPaths = [
  "m/44'/0'/0'/0", // P2PKH (Legacy)
  "m/49'/0'/0'/0", // P2SH-P2WPKH (Nested SegWit)
  "m/84'/0'/0'/0", // P2WPKH (SegWit)
  "m/86'/0'/0'/0", // P2TR (Taproot)
  
]

async function addressSummary(address) {
  const result = await client.get(`/coin/address/${address}`);
  return {
    address: address,
    totalReceived: result.chain_stats ? result.chain_stats.funded_txo_sum : 0,
  }
}

async function accountDiscovery(hdNode, derivationPath, gapLimit) {
  const relativePath = derivationPath.split('/').slice(-2).join('/'); // Get the last two parts of the path
  let chain = new bip32utils.Chain(hdNode.derivePath(relativePath));
  console.log(chain.get())


  let checked = 0;
  let usedAddresses = 0;

  // while (true) {
  //   let batch = [];
  //   for (let i = 0; i < gapLimit; i++) {
  //     batch.push(chain.derive(1).keyPair.getAddress().toBase58(network));
  //   }

  //   let summaries = await Promise.all(batch.map(addressSummary));

  //   let areUsed = summaries.map((summary) => summary.totalReceived > 0);
  //   let unusedInBatch = 0;

  //   for (let used of areUsed) {
  //     if (used) {
  //       usedAddresses++;
  //       unusedInBatch = 0;
  //     } else {
  //       unusedInBatch++;
  //     }
  //   }

  //   checked += batch.length;

  //   if (unusedInBatch >= gapLimit) {
  //     // Remove unused addresses after the last used address
  //     for (let i = 1; i < unusedInBatch; ++i) chain.pop();
  //     break;
  //   }
  // }

  return {
    used: usedAddresses,
    checked: checked,
    chain: chain,
  };
}



async function discoverAllPaths(xpub, gapLimit) {

    for (let path of derivationPaths) {
      let result = await accountDiscovery(xpub, path, gapLimit);
      console.log(`Derivation Path: ${path}`);
      console.log(`Derivation Path: ${path}`)
      console.log(`Discovered at most ${result.used} used addresses`)
      console.log(`Checked ${result.checked} addresses`)
      console.log(`With at least ${result.checked - result.used} unused addresses`)
      console.log('Total number of addresses (after prune):', result.chain.addresses.length)
      console.log('--------------------------------------')
  }
}



async function importWatchOnly(xpub) {
      const walletClient = new bcoin.WalletClient(walletOptions);
      const wallet = walletClient.wallet("primary"); //dummy
      const options = {name: "random", type: "menace", passphrase: "secret123"}//more random stuff
      const result = await wallet.createAccount("random", options);
      console.log(result);
}
