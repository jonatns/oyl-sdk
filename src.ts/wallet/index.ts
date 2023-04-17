import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import bip32utils from 'bip32-utils';
import {mnemonicToSeedSync, generateMnemonic} from 'bip39';
import bitcoin  from 'bitcoinjs-lib';
import Chain from "./chain"
import requireGlobal from '../../scripts'
const bcoin = requireGlobal("bcoin");
const bip32 = BIP32Factory(ecc);

export async function deriveXpubFromSeed(menmonic, network, coinType?,){
 
  const mnemonic = bcoin.Mnemonic.fromPhrase(menmonic);
  const priv = bcoin.HDPrivateKey.fromMnemonic(mnemonic);
  const bip44Key = priv.derive(44, true); //TO-D0, pass CoinType here instead of hardcoding *44*

  // m'/44'/0' OR m'/coinType'/0'
  const bitcoinKey = bip44Key.derive(0, true);

  // m'/44'/0'/0' OR m'/coinType'/0'/0'
  const accountKey = bitcoinKey.derive(0, true);

  // account extended public key
  // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Serialization_format
  const xpub = accountKey.xpubkey(network);

 return xpub;

}






