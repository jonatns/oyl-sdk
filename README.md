# wallet-lib

Utilities for core bitcoin wallet with client-side ordinal handling

Uses bcoin Node, possibly extensible by passing in host param


To parse Inscriptions from an Address using  bcoin - Transactions (see https://bcoin.io/api-docs/index.html?shell--cli#get-tx-by-address):

 You need to consider, if the inscription has been sent after minting (reveal tx). In   
 - First, getunspentOutputs on the address
 - For each utxo, get parse input & output scripts for inscription ('getrawtransaction', 'decoderawtransaction'):
     - For the case of inscription genesis transactions (revealtransaction), look for the first input's txwitness (decodedtx.vin[0].txinwitness)
       - Create new bcoin.Script from hex
       - Convert to array:  script.toArray()
       - Inscription envelope type (ord) is on script.toArray()[4].data.toString()

  
  ## Getting Started

  Clone from repository

  Run ```yarn```.

  Note: Most packages in npm are outdated/unsupported. For stable releases, install dependencies from git repo:

```

  yarn add https://github.com/bcoin-org/bcurl

  npm install https://github.com/bcoin-org/bcurl

```
  Currently working towards making every dependency local from github releases


  To build typescript files, just run ```yarn build``` or ```tsc```. They do pretty much the same thing rn


  Contributions, issues, PRs are all welcome  

    


TODO

- Pack bcoin Classes as a module that runs in browser (DONE)

- Use bclient to make rpc requests (DONE)

- Identify inscription from address (DONE)

- Identify inscription from address (DONE)

- Write send inscription

- Enforce types and document the code

- Write send BTC

- Write cli.ts so there is a command line client to test

- Write tests
