# wallet-lib

Utilities for client-side ordinal handling


requires bcoin

To parse Inscriptions from an Address using  bcoin - Transactions (see https://bcoin.io/api-docs/index.html?shell--cli#get-tx-by-address):

 You need to consider, if the inscription has been sent after minting (reveal tx). In   
    First, getunspentOutputs on the address
    For each utxo, parse input & output scripts for inscription:
        For the case of inscription genesis transactions (revealtransaction), look in the inputs
    


TODO

- Pack bcoin as a module that runs in browser

- Identify utxo with inscription

- Create send inscription

- Create send BTC