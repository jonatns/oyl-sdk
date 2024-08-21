import { ESTIMATE_TX_SIZE, addInputConditionally, buildPsbtWithFee, calculateAmountGathered, getAllUTXOsWorthASpecificValue, getUTXOsToCoverAmount } from "../helpers"
import { ConditionalInput, GenOkxRuneUnsignedPsbt, OutputTxTemplate } from "../types"
import * as bitcoin from 'bitcoinjs-lib'


export async function buildOkxRunesPsbt({
    address,
    utxos,
    network,
    pubKey,
    orderPrice,
    sellerPsbt,
    addressType,
    sellerAddress,
    decodedPsbt,
    feeRate,
    receiveAddress
}: GenOkxRuneUnsignedPsbt) {

    const _sellerPsbt = bitcoin.Psbt.fromBase64(sellerPsbt, { network})
    const dummyUtxos = []
    const amountNeeded = orderPrice + parseInt((ESTIMATE_TX_SIZE * feeRate).toFixed(0))


    const allUtxosWorth600 =  getAllUTXOsWorthASpecificValue(utxos, 600)
    if (allUtxosWorth600.length >= 2) {
      for (let i = 0; i < 2; i++) {
        dummyUtxos.push({
            txHash: allUtxosWorth600[i].txId,
            vout: allUtxosWorth600[i].outputIndex,
            coinAmount: allUtxosWorth600[i].satoshis
        })
      }
    }

    const retrievedUtxos = await getUTXOsToCoverAmount({
        utxos,
        amountNeeded,
        excludedUtxos: dummyUtxos
    })
    
    if (retrievedUtxos.length === 0) {
      throw new Error('Not enough funds to purchase this offer')
    }

    const txInputs: ConditionalInput[] = []
    const txOutputs: OutputTxTemplate[] = []


    // Add the first UTXO from retrievedUtxos as input index 0
    txInputs.push(addInputConditionally({
        hash: retrievedUtxos[0].txId,
        index: retrievedUtxos[0].outputIndex,
        witnessUtxo: {
            value: retrievedUtxos[0].satoshis,
            script: Buffer.from(retrievedUtxos[0].scriptPk, 'hex'),
        },
    }, addressType, pubKey))

    const sellerInputData = _sellerPsbt.data.inputs[1]


    // Add seller UTXO as input index 1
    const sellerInput = {
        hash: decodedPsbt.tx.vin[1].txid,
        index: decodedPsbt.tx.vin[1].vout,
        witnessUtxo: {
          value: sellerInputData.witnessUtxo.value,
          script: sellerInputData.witnessUtxo.script,
        },
        sighashType: bitcoin.Transaction.SIGHASH_SINGLE | bitcoin.Transaction.SIGHASH_ANYONECANPAY,
      }

      if ( sellerInputData?.tapInternalKey != null){
        sellerInput["tapInternalKey"] = sellerInputData?.tapInternalKey
      }
    
      txInputs.push(sellerInput);


      //Add remaining UTXOS as input to cover amount needed & fees
      for (let i = 1; i < retrievedUtxos.length; i++) {
        txInputs.push(addInputConditionally({
          hash: retrievedUtxos[i].txId,
          index: retrievedUtxos[i].outputIndex,
          witnessUtxo: {
              value: retrievedUtxos[i].satoshis,
              script: Buffer.from(retrievedUtxos[i].scriptPk, 'hex'),
          },
      }, addressType, pubKey))
      }

      txOutputs.push({
        address: receiveAddress, // Buyer's receiving address at index 0
        value: sellerInputData.witnessUtxo.value,
    })

      txOutputs.push({
        address: sellerAddress, // Seller's output address at index 1
        value: orderPrice,
      });
   

    const amountRetrieved = calculateAmountGathered(retrievedUtxos)
    const changeAmount = amountRetrieved - amountNeeded
    let changeOutput: OutputTxTemplate | null = null

    if (changeAmount > 0) changeOutput = { address, value: changeAmount }

    
    const {psbtBase64} = buildPsbtWithFee({
        inputTemplate: txInputs,
        outputTemplate: txOutputs,
        utxos,
        changeOutput,
        retrievedUtxos,
        spendAddress: address,
        spendPubKey: pubKey,
        amountRetrieved,
        spendAmount: orderPrice,
        feeRate,
        network,
        addressType
    })

    return psbtBase64;
  }