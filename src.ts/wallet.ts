import bip32utils from 'bip32-utils'
import * as bitcoin from "bitcoinjs-lib"
import bcoin from "bcoin"


const network = bcoin.Network.get('testnet')
const client = new bcoin.NodeClient({
  network: 'testnet',
  apiKey: 'YOUR_API_KEY'
})

const derivationPaths = [
  "m/44'/1'/0'/0", // P2PKH (Legacy)
  "m/49'/1'/0'/0", // P2SH-P2WPKH (Nested SegWit)
  "m/84'/1'/0'/0", // P2WPKH (SegWit)
  // Add any other paths you'd like to support, e.g., Taproot
]

async function addressSummary(address) {
  const result = await client.get(`/coin/address/${address}`);
  return {
    address: address,
    totalReceived: result.chain_stats ? result.chain_stats.funded_txo_sum : 0,
  }
}

async function accountDiscovery(hdNode, derivationPath, gapLimit) {
  let chain = new bip32utils.Chain(hdNode.derivePath(derivationPath))
  let checked = 0
  let usedAddresses = 0

  while (true) {
    let batch = chain.next(gapLimit).map((node) => node.getAddress())
    let summaries = await Promise.all(batch.map(addressSummary))

    let areUsed = summaries.map((summary) => summary.totalReceived > 0)
    let unusedInBatch = 0

    for (let used of areUsed) {
      if (used) {
        usedAddresses++
        unusedInBatch = 0
      } else {
        unusedInBatch++
      }
    }

    checked += batch.length

    if (unusedInBatch >= gapLimit) {
      // Remove unused addresses after the last used address
      for (let i = 1; i < unusedInBatch; ++i) chain.pop()
      break
    }
  }

  return {
    used: usedAddresses,
    checked: checked,
    chain: chain,
  }
}

async function discoverAllPaths(seedHex, gapLimit) {
  let hdNode = bip32.fromSeed(Buffer.from(seedHex, 'hex'), network)

  for (let path of derivationPaths) {
    let result = await accountDiscovery(hdNode, path, gapLimit)
    console.log(`Derivation Path: ${path}`)
    console.log(`Discovered at most ${result.used} used addresses`)
    console.log(`Checked ${result.checked} addresses`)
    console.log(`With at least ${result.checked - result.used} unused addresses`)
    console.log('Total number of addresses (after prune):', result.chain.addresses.length)
    console.log('--------------------------------------')
  }
}

let seedHex = 'YOUR_SEED_HEX'
let gapLimit = 20

discoverAllPaths(seedHex, gapLimit)
  .then(() => console.log('Account discovery completed'))
  .catch((err) => console.error('Account discovery failed:', err))
