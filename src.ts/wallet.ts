import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import bip32utils from 'bip32-utils';
import {mnemonicToSeedSync, generateMnemonic} from 'bip39';
import bitcoin  from 'bitcoinjs-lib';
import requireGlobal from '../scripts'
const bcoin = requireGlobal("bcoin");
const bip32 = BIP32Factory(ecc);

export async function deriveXpubFromSeed(menmonic){
  const seed = mnemonicToSeedSync(menmonic);
  const node = bip32.fromSeed(seed);
  const bip32PubKey = node.neutered();
  const xpubString = bip32PubKey.toBase58();
  return xpubString;
}



// async function importWatchOnly(xpub) {
//       const walletClient = new bcoin.WalletClient(walletOptions);
//       const wallet = walletClient.wallet("primary"); //dummy
//       const options = {name: "random", type: "menace", passphrase: "secret123"}//more random stuff
//       const result = await wallet.createAccount("random", options);
//       console.log(result);
// }