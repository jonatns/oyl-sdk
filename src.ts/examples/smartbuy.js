//IMPORT OKX API LIB

//GET PSBT BASED ON MAX COST

//BUILD SWAP TX
/*
function testMarketplaceBuy (){
const options = {
  address: process.env.TAPROOT_ADDRESS,
  pubKey: process.env.TAPROOT_PUBKEY,
  feeRate: parseFloat(process.env.FEE_RATE),
  psbtBase64: process.env.PSBT_BASE64,
  price: 0.001
}
const intent = new BuildMarketplaceTransaction(options)
const builder = await intent.psbtBuilder();
console.log(builder)
}
*/
//SWAP TX WILL RETURN THE PSBT HEX
//SIGN AND FINALIZE PSBT HEX
/*
export async function swapFlow() {
  const address = process.env.TAPROOT_ADDRESS
   const feeRate = parseFloat(process.env.FEE_RATE)
   const mnemonic = process.env.TAPROOT_MNEMONIC
  const pubKey = process.env.TAPROOT_PUBKEY

  const psbt = bitcoin.Psbt.fromHex(process.env.PSBT_HEX, {
    network: bitcoin.networks??,
  })

  
  const wallet = new Wallet()
  const payload = await wallet.fromPhrase({
    mnemonic: mnemonic.trim(),
    hdPath: process.env.HD_PATH,
    type: process.env.TYPE,
  })

   const keyring = payload.keyring.keyring
   const signer = keyring.signTransaction.bind(keyring)
   const from = address
   const addressType = transactions.getAddressType(from)
   if (addressType == null) throw Error('Invalid Address Type')

   const tx = new PSBTTransaction(signer, from, pubKey, addressType, feeRate)
   const signedPsbt = await tx.signPsbt(psbt, false)
   signedPsbt.finalizeAllInputs()
   console.log(signedPsbt.toBase64())
   //@ts-ignore
   psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false
 
   //EXTRACT THE RAW TX
   const rawtx = signedPsbt.extractTransaction().toHex()
   console.log('rawtx', rawtx)
   //BROADCAST THE RAW TX TO THE NETWORK
   const result = await wallet.apiClient.pushTx({ transactionHex: rawtx })
   //GET THE TX_HASH
   console.log(result)
   const ready_txId = psbt.extractTransaction().getId()
   console.log(ready_txId)
   //CONFIRM TRANSACTION IS CONFIRMED
}
*/
