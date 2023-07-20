# wallet-lib

Utilities for core bitcoin wallet with client-side ordinal handling

Uses bcoin Node, possibly extensible by passing in host param

To parse Inscriptions from an Address using bcoin - Transactions (see https://bcoin.io/api-docs/index.html?shell--cli#get-tx-by-address):

You need to consider, if the inscription has been spent after minting (reveal tx).

- First, getunspentOutputs on the address
- For each utxo, get parse input & output scripts for inscription ('getrawtransaction', 'decoderawtransaction'):
  - For the case of inscription genesis transactions (revealtransaction), look for the first input's txwitness (decodedtx.vin[0].txinwitness)
    - Create new bcoin.Script from hex
    - Convert to array: script.toArray()
    - Inscription envelope type ("ord") is on script.toArray()[4].data.toString()

## Getting Started

Clone from repository

Run `yarn`.

Note: Most packages in npm are outdated/unsupported. For stable releases, install dependencies from git repo:

```
  yarn add https://github.com/bcoin-org/bcurl
```

```
  npm install https://github.com/bcoin-org/bcurl
```

Currently working towards making every dependency local from github releases

To build typescript files to js , just run `yarn build` or `tsc`. They do pretty much the same thing rn

To run oylib on the command line, you can install the package globally. Just run:

```
 npm i -g
```

The cli client is simply a layer over the oylib instance. The `load` commands defined is defined in cli.ts.

It returns the `clientOptions` for your current session

```
wallet load
```

returns

```
{
  network: 'main',
  port: 8332,
  host: '198.199.72.193',
  apiKey: 'bikeshed'
}
```

It also accepts custom parameters:

```
wallet load --port 8334
```

To call methods on the object, pass in the method name in `snake-case` and add the parameter as a flag option also in `snake-case` :

```
wallet get-address-summary --address bc1p527kv6mrq2sn5l7ukapq4q4a4puqfd9jsm7fv6r06c5726kyk57qnfvs4e --host 198.199.72.193 --port 8334 --node-client false
```

returns

```
{
  network: 'main',
  port: 8334,
  host: '198.199.72.193',
  apiKey: 'bikeshed'
}

getAddressSummary(bc1p527kv6mrq2sn5l7ukapq4q4a4puqfd9jsm7fv6r06c5726kyk57qnfvs4e)

[
  {
    "utxo": [
      {
        "tx_hash_big_endian": "96ea0ce6c073ff27d7c598c2b4929712e5ff6f68fdf7c1520253f8921d04a083",
        "tx_hash": "83a0041d92f8530252c1f7fd686fffe5129792b4c298c5d727ff73c0e60cea96",
        "tx_output_n": 0,
        "script": "5120a2bd666b6302a13a7fdcb7420a82bda87804b4b286fc96686fd629e56ac4b53c",
        "value": 10000,
        "value_hex": "2710",
        "confirmations": 10988,
        "tx_index": 4631145185697546
      }
    ],
    "balance": 0.0001
  }
]
```

# Create Wallet

```
wallet create-wallet
```

This will create a taproot wallet, you can optionally pass the type of wallet for example to create a **Segwit** wallet:

```
wallet create-wallet --type segwit
```

# Get Address from Public key

You can get the taproot or segwit address using only the public key for example

```
wallet get-taproot-address --public-key [public_key_hex]
```

```
wallet get-segwit-address --public-key [public_key_hex]
```

# Import Wallet from Mnemonic

You can import a wallet from a mnemonic phrase for example

```
wallet import-wallet --mnemonic "mesh delay aim town envelope grass sick dutch bind convince fade pulp"

```

When importing a wallet with funds on it, it is important to note the hdPath & type of address
holding the funds for instance.

This lib expects that the hdPath and type of address to match, e.g a segwit address' hdPath must have the 49 type ("m/49'/0'......).

Typically since the lib supports just taproot and segwit addresses, you'd expect the hdPath options to be binary. However, when considering
that different wallet applications have different default hd paths (and some with option for custom paths). It is essential to allow the path
spelt out to match the dynamic cases.

For the type of address, you can simply pass "segwit" or "taproot" as parameters (just like in Create Wallet);

The default hdPath parameter is "`m/86'/0'/0'/0`" and the default type is "taproot". It is important to keep note of this in case
the hdPath is passed without a type. Remember (as stated above) This lib expects that the hdPath and type of address to match

For instance, say a taproot wallet created on **Sparrow** with path "m/86'/0'/0'/1" is to be imported into, run:

```
 wallet import-wallet --mnemonic "mesh delay aim town envelope grass sick dutch bind convince fade pulp" --path "m/86'/0'/0'/1" --type taproot
```

To send a BTC transaction

```
const client = new WalletUtils()
const mnemonic = "random mnemonic phrases"

const payload = await client.importWallet({
  mnemonic: mnemonic.trim(),
  hdPath: "m/49'/0'/0'",
  type: 'segwit',
})

const keyring = payload.keyring.keyring;
const pubKey = keyring.wallets[0].publicKey.toString('hex');
const signer = keyring.signTransaction.bind(keyring);
const from = payload.keyring.address;
const to = "bc1q**recipient btc address***";
const changeAddress = from;
const amount = 0.00001;
const fee = await client.getFees();
const network = "main";

return await client.sendBtc({publicKey: pubKey, from: from, to: to, changeAddress: changeAddress, amount: amount, fee: fee.medium, network: network, signer: signer })
  
```

Contributions, issues, PRs are all welcome
