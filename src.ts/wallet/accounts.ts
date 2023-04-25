
/*
*
*
The  parent key should be able to be derived sequentially. The UI can select/change
the path parameters (e.g "44"/"49"/"86")  
*/


// export async function deriveXpubFromSeed(menmonic, network, coinType?,){
 
//   const mnemonic = bcoin.Mnemonic.fromPhrase(menmonic);
//   const priv = bcoin.HDPrivateKey.fromMnemonic(mnemonic);
//   const bip44Key = priv.derive(44, true); //TO-D0, pass CoinType here instead of hardcoding *44*

//   // m'/44'/0' OR m'/coinType'/0'
//   const bitcoinKey = bip44Key.derive(0, true);

//   // m'/44'/0'/0' OR m'/coinType'/0'/0'
//   const accountKey = bitcoinKey.derive(0, true);

//   // account extended public key
//   // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Serialization_format
//   const xpub = accountKey.xpubkey(network);

//  return xpub;

// }






