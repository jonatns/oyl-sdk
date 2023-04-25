import { PrevOut, Output, Transaction } from '../interface/transaction'
import fetch from "node-fetch"


/**
 * 
 Returns from https://www.blockchain.com/explorer/api/blockchain_api.
 One way UTXOs can be gotten directly from the node is with RPC command - 'gettxout'
 However this accepts a single transaction as a parameter, making it impratical to use
 directly when getting UTXOs by address/public key. The best idea will be to index the 
 all UTXOs from the blockchain in a db (just like with wallets and transactions on bcoin) 
 and extend the bcoin RPC server. To return the nodes.
 Also consider - if this is a client wallet that can be run with a custom server, there will
 need to be a default alternative outside Oyl Api (e.g the blockchainApi)   
 *
 */

export const getUnspentOutputs = async (address) => {
    try {
        const response = await fetch(`https://blockchain.info/unspent?active=${address}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch inscriptions for address ${address}`);
        }

        const jsonResponse = await response.json()

        return jsonResponse;



    } catch(error){
        console.log(Error);
    }
}

export const  calculateBalance =  function (utxos): number  {
    let balance = 0;
    for (let utxo = 0; utxo < utxos.length; utxo++) {
        balance += utxos[utxo].value;
    }
    return balance / 1e8; // Convert from satoshis to BTC
}
