// import { IBlockchainInfoUTXO } from "../shared/interface"
// import * as bitcoin from 'bitcoinjs-lib'
// import { ECPair, assertHex } from "../shared/utils"

// interface IBISTransferableInscription {
//     inscription_id: string
//     inscription_number: number
//     ticker: string
//     transfer_amount: string
//     is_valid: boolean
//     is_used: boolean
//     satpoint: string
//     min_price: any
//     min_unit_price: any
//     ordinalswallet_price: any
//     ordinalswallet_unit_price: any
//     unisat_price: any
//     unisat_unit_price: any
//   }

// interface OmniOrderData {
//     address: string
//     amount: string
//     price: string
//     psbtHex: string
//     psbtBase64: string
//     ticker: string
//     transferableInscription: IBISTransferableInscription
//   }

// export const fillOutOkxOrder = ({
//     allUtxosWorth600,
//     offerPsbt,
//     retrievedUtxos,
//     buyerAddress,
//     sellAddress,
//     remainder,
//   }: {
//     allUtxosWorth600: IBlockchainInfoUTXO[]
//     offerPsbt: string
//     retrievedUtxos: IBlockchainInfoUTXO[]
//     buyerAddress: string
//     sellAddress: string
//     remainder: number
//   }) => {
//     const userPsbt = new bitcoin.Psbt()
//     const offerPsbtObj = bitcoin.Psbt.fromBase64(offerPsbt)
//     const pubKey = ECPair.fromPrivateKey(
//       Buffer.from(String(process.env['PRIVATE_KEY']), 'hex')
//     ).publicKey
  
//     for (let i = 0; i < 2; i++) {
//       userPsbt.addInput({
//         hash: allUtxosWorth600[i].tx_hash_big_endian,
//         index: allUtxosWorth600[i].tx_output_n,
//         witnessUtxo: {
//           value: allUtxosWorth600[i].value,
//           script: Buffer.from(allUtxosWorth600[i].script, 'hex'),
//         },
//         tapInternalKey: assertHex(pubKey),
//       })
//     }
  
//     const theirInputData = offerPsbtObj.data.inputs[2]
//     const toBuyTransferInscriptionTxId = Buffer.from(
//       offerPsbtObj.txInputs[2].hash
//     )
//       .reverse()
//       .toString('hex')
  
//     const neededSats = offerPsbtObj.txOutputs[2].value
  
//     console.log({ theirInputData })
//     console.log({ toBuyTransferInscriptionTxId })
//     console.log({ neededSats })
//     console.log({ sellAddress })
  
//     userPsbt.addInput({
//       hash: toBuyTransferInscriptionTxId,
//       index: 0,
//       witnessUtxo: {
//         value: theirInputData?.witnessUtxo?.value as number,
//         script: theirInputData?.witnessUtxo?.script as Buffer,
//       },
//       tapInternalKey: theirInputData.tapInternalKey,
//       tapKeySig: theirInputData.tapKeySig,
//       sighashType:
//         bitcoin.Transaction.SIGHASH_SINGLE |
//         bitcoin.Transaction.SIGHASH_ANYONECANPAY,
//     })
  
//     for (let i = 0; i < retrievedUtxos.length; i++) {
//       userPsbt.addInput({
//         hash: retrievedUtxos[i].tx_hash_big_endian,
//         index: retrievedUtxos[i].tx_output_n,
//         witnessUtxo: {
//           value: retrievedUtxos[i].value,
//           script: Buffer.from(retrievedUtxos[0].script, 'hex'),
//         },
//         tapInternalKey: assertHex(pubKey),
//       })
//     }
  
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: 1200,
//     })
  
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: 546,
//     })
  
//     userPsbt.addOutput({
//       address: sellAddress,
//       value: neededSats,
//     })
  
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: 600,
//     })
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: 600,
//     })
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: Math.floor(remainder),
//     })
  
//     return userPsbt
//   }

//   async function processRemainingOrders(
//     address: string,
//     tweakedSigner: bitcoin.Signer,
//     orders: OmniOrderData[],
//     index = 1,
//     previousOrderTxId: string,
//     remainingSats: number,
//     psbtBase64s: string[] = [],
//     psbtHexs = [],
//     txIds = []
//   ) {
//     console.log({ remainingSats })
//     if (index >= orders.length) {
//       return { txIds, psbtHexs, psbtBase64s }
//     }
//     const order = orders[index]
//     const { psbtBase64: filledOutBase64, remainingSats: updatedRemainingSats } =
//       await fillOutTheRestOfOkxOrder({
//         offerPsbt: order.psbtBase64,
//         previousOrderTxId,
//         remainingSats,
//         buyerAddress: address,
//         sellAddress: order.address,
//       })
//     const tempPsbt = bitcoin.Psbt.fromBase64(filledOutBase64)
//     const inputs = tempPsbt.txInputs
//     for (let i = 0; i < inputs.length; i++) {
//       if (i === 2) continue
//       tempPsbt.signInput(i, tweakedSigner)
//       tempPsbt.finalizeInput(i)
//     }
//     psbtBase64s.push(tempPsbt.toBase64())
//     const { result } = await callBTCRPCEndpoint(
//       'finalizepsbt',
//       tempPsbt.toBase64()
//     )
//     psbtHexs.push(result.hex)
//     const { result: decodeAgain }: { result: { txid: string } } =
//       await callBTCRPCEndpoint('decoderawtransaction', result.hex)
//     txIds.push(decodeAgain.txid)
//     // Call the same function with the next index and updated previousOrderTxId and remainingSats
//     return processRemainingOrders(
//       address,
//       tweakedSigner,
//       orders,
//       index + 1,
//       decodeAgain.txid,
//       updatedRemainingSats,
//       psbtBase64s,
//       psbtHexs,
//       txIds
//     )
//   }


//   export const fillOutTheRestOfOkxOrder = async ({
//     offerPsbt,
//     previousOrderTxId,
//     buyerAddress,
//     sellAddress,
//     remainingSats,
//   }: {
//     offerPsbt: string
//     previousOrderTxId: string
//     buyerAddress: string
//     sellAddress: string
//     remainingSats: number
//   }) => {
//     const userPsbt = new bitcoin.Psbt()
//     const offerPsbtObj = bitcoin.Psbt.fromBase64(offerPsbt)
//     const pubKey = ECPair.fromPrivateKey(
//       Buffer.from(String(process.env['PRIVATE_KEY']), 'hex')
//     ).publicKey
//     const script = await getScriptForAddress(buyerAddress)
//     userPsbt.addInput({
//       hash: previousOrderTxId,
//       index: 3,
//       witnessUtxo: {
//         value: 600,
//         script: Buffer.from(script, 'hex'),
//       },
//       tapInternalKey: assertHex(pubKey),
//     })
//     userPsbt.addInput({
//       hash: previousOrderTxId,
//       index: 4,
//       witnessUtxo: {
//         value: 600,
//         script: Buffer.from(script, 'hex'),
//       },
//       tapInternalKey: assertHex(pubKey),
//     })
//     const theirInputData = offerPsbtObj.data.inputs[2]
//     const toBuyTransferInscriptionTxId = Buffer.from(
//       offerPsbtObj.txInputs[2].hash
//     )
//       .reverse()
//       .toString('hex')
//     const neededSats = offerPsbtObj.txOutputs[2].value
//     console.log({ theirInputData })
//     console.log({ toBuyTransferInscriptionTxId })
//     console.log({ neededSats })
//     console.log({ sellAddress })
//     userPsbt.addInput({
//       hash: toBuyTransferInscriptionTxId,
//       index: 0,
//       witnessUtxo: {
//         value: theirInputData?.witnessUtxo?.value as number,
//         script: theirInputData?.witnessUtxo?.script as Buffer,
//       },
//       tapInternalKey: theirInputData.tapInternalKey,
//       tapKeySig: theirInputData.tapKeySig,
//       sighashType:
//         bitcoin.Transaction.SIGHASH_SINGLE |
//         bitcoin.Transaction.SIGHASH_ANYONECANPAY,
//     })
//     userPsbt.addInput({
//       hash: previousOrderTxId,
//       index: 5,
//       witnessUtxo: {
//         value: remainingSats,
//         script: Buffer.from(script, 'hex'),
//       },
//       tapInternalKey: assertHex(pubKey),
//     })
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: 1200,
//     })
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: 546,
//     })
//     userPsbt.addOutput({
//       address: sellAddress,
//       value: neededSats,
//     })
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: 600,
//     })
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: 600,
//     })
//     userPsbt.addOutput({
//       address: buyerAddress,
//       value: Math.floor(remainingSats - neededSats - 1200),
//     })
//     return {
//       psbtHex: userPsbt.toHex(),
//       psbtBase64: userPsbt.toBase64(),
//       remainingSats: remainingSats - neededSats - 1200,
//     }
//   }