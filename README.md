# wallet-lib

Utilities for core bitcoin wallet with client-side ordinal handling

Uses bcoin Node, possibly extensible by passing in host param


To parse Inscriptions from an Address using  bcoin - Transactions (see https://bcoin.io/api-docs/index.html?shell--cli#get-tx-by-address):

 You need to consider, if the inscription has been spent after minting (reveal tx).   
 - First, getunspentOutputs on the address
 - For each utxo, get parse input & output scripts for inscription ('getrawtransaction', 'decoderawtransaction'):
     - For the case of inscription genesis transactions (revealtransaction), look for the first input's txwitness (decodedtx.vin[0].txinwitness)
       - Create new bcoin.Script from hex
       - Convert to array:  script.toArray()
       - Inscription envelope type ("ord") is on script.toArray()[4].data.toString()

  
  ## Getting Started

  Clone from repository

  Run ```yarn```.

  Note: Most packages in npm are outdated/unsupported. For stable releases, install dependencies from git repo:

```
  yarn add https://github.com/bcoin-org/bcurl
```

```
  npm install https://github.com/bcoin-org/bcurl
```
  Currently working towards making every dependency local from github releases


  To build typescript files to js  , just run ```yarn build``` or ```tsc```. They do pretty much the same thing rn

  To run oylib on the command line, you can install the package globally. Just run:

  ```
   npm i -g 
  ```
   
   The cli client is simply a layer over the oylib instance. The ```load``` commands defined is defined in cli.ts.
   
   It returns the ```clientOptions``` for your current session


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

 To call methods on the object, pass in the method name in ```snake-case``` :

 ```
 wallet get-address-summary bc1p527kv6mrq2sn5l7ukapq4q4a4puqfd9jsm7fv6r06c5726kyk57qnfvs4e --host 198.199.72.193 --port 8334 --node-client false 
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


  Contributions, issues, PRs are all welcome  

    