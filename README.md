# wallet-lib

Utilities for client-side ordinal handling


requires bcoin

To parse Inscriptions from an Address using  bcoin - Transactions (see https://bcoin.io/api-docs/index.html?shell--cli#get-tx-by-address):

 You need to consider, if the inscription has been sent after minting (reveal tx). In   
 - First, getunspentOutputs on the address
 - For each utxo, get parse input & output scripts for inscription ('getrawtransaction', 'decoderawtransaction'):
     - For the case of inscription genesis transactions (revealtransaction), look for the first input's txwitness (decodedtx.vin[0].txinwitness)
       - Create new bcoin.Script from hex
       - Convert to array:  script.toArray()
       - Inscription envelope type (ord) is on script.toArray()[4].data.toString()

     - For the case of inscriptions received from someone else (transferred) 
    


TODO

- Pack bcoin as a module that runs in browser

- Identify utxo with inscription

- Create send inscription

- Create send BTC