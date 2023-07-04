import { PrevOut, Output, Transaction } from "../interface/transaction";
import fetch from "node-fetch";

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
    const response = await fetch(
      `https://blockchain.info/unspent?active=${address}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch unspent output for address ${address}`);
    }

    const jsonResponse = await response.json();

    return jsonResponse;
  } catch (error) {
    console.log(Error);
  }
};

export const getBtcPrice = async () => {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch btc price from binance`);
    }

    const jsonResponse = await response.json();

    return jsonResponse;
  } catch (error) {
    console.log(Error);
  }
};

export const calculateBalance = function (utxos): number {
  let balance = 0;
  for (let utxo = 0; utxo < utxos.length; utxo++) {
    balance += utxos[utxo].value;
  }
  return balance / 1e8; // Convert from satoshis to BTC
};

export const convertUsdValue = async (amount) => {
  const pricePayload = await getBtcPrice();
  const btcPrice = parseFloat(pricePayload.price);
  const amountInBTC = parseFloat(amount) * btcPrice;
  return amountInBTC.toFixed(2);
};

export const getMetaUtxos = async (utxos, inscriptions) => {
  const formattedData = [];

  for (const utxo of utxos) {
    const formattedUtxo = {
      txId: utxo.tx_hash_big_endian,
      outputIndex: utxo.tx_output_n,
      satoshis: utxo.value,
      scriptPk: utxo.script,
      addressType: getAddressType(utxo.script),
      address: "bc1q3mzwe3thhtjrz7ng7d5jr7ef22safuxyh7nysj",
      inscriptions: [],
    };

    for (const inscription of inscriptions) {
      if (inscription.id.includes(utxo.tx_hash_big_endian)) {
        formattedUtxo.inscriptions.push({
          id: inscription.id,
          num: inscription.num,
          offset: inscription.detail.offset,
        });
      }
    }

    formattedData.push(formattedUtxo);
  }

  return formattedData;
};

function getAddressType(script) {
  // Add  logic to determine the address type based on the script
  // For example, you can check if it's a P2PKH or P2SH script
  // and return the corresponding AddressType enum value

  // Assuming you have an AddressType enum defined
  // const AddressType = {
  //   P2PKH: 'P2PKH',
  //   P2SH: 'P2SH'
  // };

  enum AddressType {
    P2PKH,
    P2WPKH,
    P2TR,
    P2SH_P2WPKH,
    M44_P2WPKH,
    M44_P2TR,
  }

  return AddressType.P2WPKH;
}
