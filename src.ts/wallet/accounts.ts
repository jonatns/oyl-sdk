/*
*
*
The  parent key should be able to be derived sequentially. The UI can select/change
the path parameters (e.g "44"/"49"/"86")  
// */
import * as bitcoin from "bitcoinjs-lib";
import { HdKeyring } from "./keyrings/hdKeyring";
import { bech32, bech32m } from "bech32";

export async function createWallet(
  hdPathString: string,
  type: string
): Promise<any> {
  // Create a new instance of HdKeyring with the provided hdPathString
  const keyring = await new HdKeyring({ hdPath: hdPathString });
  // Add a single account to the keyring
  await keyring.addAccounts(1);
  // Get the first account public key
  const accounts = await keyring.getAccounts();
  const pubkey = accounts[0];
  const address = publicKeyToAddress(pubkey, type);
  const fullPayload = {};
  fullPayload["keyring"] = keyring;
  fullPayload["address"] = address;
  return fullPayload;
}

export function publicKeyToAddress(
  publicKey: string,
  type: string,
  networkType?: string
) {
  const network = bitcoin.networks.bitcoin; //toPsbtNetwork(networkType);
  if (!publicKey) return "";
  const pubkey = Buffer.from(publicKey, "hex");
  if (type === "P2PKH") {
    const { address } = bitcoin.payments.p2pkh({
      pubkey,
      network,
    });
    return address || "";
  } else if (type === "P2WPKH") {
    const { address } = bitcoin.payments.p2wpkh({
      pubkey,
      network,
    });
    return address || "";
  } else if (type === "P2TR") {
    const { address } = bitcoin.payments.p2tr({
      internalPubkey: pubkey.slice(1, 33),
      network,
    });
    return address || "";
  } else {
    return "";
  }
}

export function isValidAddress(
  address,
  network: bitcoin.Network = bitcoin.networks.bitcoin
) {
  let error;
  try {
    bitcoin.address.toOutputScript(address, network);
  } catch (e) {
    error = e;
  }
  if (error) {
    return false;
  } else {
    return true;
  }
}

export async function importMnemonic (mnemonic: string, path, type){
  const keyring = await new HdKeyring({ mnemonic: mnemonic, hdPath: path });
  // Add a single account to the keyring
  await keyring.addAccounts(1);
  // Get the first account public key
  const accounts = await keyring.getAccounts();
  //console.log(accounts);
  const pubkey = accounts[0];
  const address = publicKeyToAddress(pubkey, type);
  const fullPayload = {};
  fullPayload["keyring"] = keyring;
  fullPayload["address"] = address;
  return fullPayload;
} 