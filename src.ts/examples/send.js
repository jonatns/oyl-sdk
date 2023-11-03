 /**
  * 
  * Example implementation to send BTC DO NOT USE!!!
*/
  // async sendBtc({ mnemonic, to, amount, fee }) {

  // const payload = await this.fromPhrase({
  //   mnemonic: mnemonic.trim(),
  //   hdPath: "m/49'/0'/0'",
  //   type: 'segwit',
  // })

  // const keyring = payload.keyring.keyring;
  // const pubKey = keyring.wallets[0].publicKey.toString('hex');
  // const signer = keyring.signTransaction.bind(keyring);
  // const from = payload.keyring.address;
  // const changeAddress = from;


  // return await this.createPsbtTx({publicKey: pubKey, from: from, to: to, changeAddress: changeAddress, amount: amount, fee: fee,  signer: signer })
  // }


  /**
  * 
  * Example implementation to send Ordinal DO NOT USE!!!

async sendOrd({ mnemonic, to,  inscriptionId, inscriptionOffset, inscriptionOutputValue, fee }) {
  const payload = await this.fromPhrase({
    mnemonic: mnemonic.trim(),
    hdPath: "m/49'/0'/0'",
    type: 'segwit',
  })
  const keyring = payload.keyring.keyring;
  const pubKey = keyring.wallets[0].publicKey.toString('hex');
  const signer = keyring.signTransaction.bind(keyring);
  const from = payload.keyring.address;
  const changeAddress = from; 
  return await this.createOrdPsbtTx({ 
    publicKey: pubKey, 
    fromAddress: from, 
    toAddress: to, 
    changeAddress: changeAddress, 
    txFee: fee, 
    signer: signer, 
    inscriptionId, 
    metaOffset: inscriptionOffset, 
    metaOutputValue: inscriptionOutputValue 
  })
}
*/