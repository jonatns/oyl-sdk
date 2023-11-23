import { OylApiClient } from '../apiclient'
import {SandshrewBitcoinClient }from '../rpclient/sandshrew'
import { EsploraRpc } from "../rpclient/esplora";
import { assertHex, getSatpointFromUtxo } from "../shared/utils";
import * as transactions from '../transactions'
import * as bitcoin from 'bitcoinjs-lib'
import { AddressType } from '../shared/interface';


export class BuildMarketplaceTransaction {
    public walletAddress: string;
    public pubKey: string;
    public apiClient: OylApiClient
    public esploraRpc: EsploraRpc
    public feeRate: number
    public psbtBase64: string
    public orderPrice: number
    public sandshrewBtcClient: SandshrewBitcoinClient
    public makersAddress: string | null
    public takerScript: string


    constructor({ address, pubKey, feeRate, psbtBase64, price }: { address: string, pubKey: string, feeRate: number, psbtBase64: string, price: number }) {
        this.walletAddress = address;
        this.pubKey = pubKey;
        this.apiClient = new OylApiClient({ host: 'https://api.oyl.gg' })
        this.esploraRpc = new EsploraRpc("https://mainnet.sandshrew.io/v1/154f9aaa25a986241357836c37f8d71")
        this.sandshrewBtcClient = new SandshrewBitcoinClient("https://sandshrew.io/v1/d6aebfed1769128379aca7d215f0b689");
        this.feeRate = feeRate
        this.psbtBase64 = psbtBase64
        this.orderPrice = price
        const tapInternalKey = assertHex(Buffer.from(this.pubKey, 'hex'))
        const p2tr = bitcoin.payments.p2tr({
          internalPubkey: tapInternalKey,
          network: bitcoin.networks.bitcoin,
        })
        const addressType = transactions.getAddressType(this.walletAddress)
        if (addressType == AddressType.P2TR){
         this.takerScript = p2tr.output?.toString('hex')
        } else {
            throw Error ("Can only get script for taproot addresses")
        }

    }


    async getUTXOsToCoverAmount(
        amountNeeded: number,
        inscriptionLocs?: string[]
    ) {
        console.log("=========== Getting Unspents for address in order by value ========")
        const unspentsOrderedByValue = await this.getUnspentsForAddressInOrderByValue()
        console.log("unspentsOrderedByValue:",  unspentsOrderedByValue)
        console.log("=========== Getting Collectibles for address " + this.walletAddress + "========")
        const retrievedIxs = (await this.apiClient.getCollectiblesByAddress(this.walletAddress)).data
        console.log("=========== Collectibles:",  retrievedIxs)
        console.log("=========== Gotten Collectibles, splitting utxos ========")
        const bisInscriptionLocs = retrievedIxs.map(
            (utxo) => utxo.satpoint
        ) as string[]

        if (bisInscriptionLocs.length === 0) {
            inscriptionLocs = []
        } else {
            inscriptionLocs = bisInscriptionLocs
        }

        let sum = 0
        const result: any = []
        console.log("=========== Available inscription utxos: ", inscriptionLocs)
        for await (let utxo of unspentsOrderedByValue) {
            const currentUTXO = utxo
            const utxoSatpoint = getSatpointFromUtxo(currentUTXO)
            if (
                (inscriptionLocs &&
                    inscriptionLocs?.find((utxoLoc: any) => utxoLoc === utxoSatpoint)) ||
                currentUTXO.value <= 546
            ) {
                continue
            }
            sum += currentUTXO.value
            result.push(currentUTXO)
            if (sum > amountNeeded) {
                console.log('AMOUNT RETRIEVED: ', sum)
                return result
            }
        }

        return []
    }

    async psbtBuilder() {
        console.log("=========== Decoding PSBT with bitcoinjs ========")
        const marketplacePsbt = bitcoin.Psbt.fromBase64(this.psbtBase64)
        const costPrice = this.orderPrice * 100000000
        const requiredSatoshis = (costPrice) + 30000 + 546 + 1200
        const retrievedUtxos = await this.getUTXOsToCoverAmount(
            requiredSatoshis
        )
        if (retrievedUtxos.length === 0) {
            throw Error("Not enough funds to purchase this offer")
        }

        console.log("=========== Getting UTXOS Worth 600 sats ========")
        const allUtxosWorth600 = await this.getAllUTXOsWorthASpecificValue(600)
        console.log("=========== UTXOs worth 600 sats: ", allUtxosWorth600)
        if (allUtxosWorth600.length < 2) {
            throw Error("not enough padding utxos (600 sat) for marketplace buy")
        }

        console.log("=========== Getting Maker's Address ========")
        await this.getMakersAddress()
        console.log("=========== Makers Address: ", this.makersAddress)
        if (!this.makersAddress){
            throw Error("Could not resolve maker's address")
        }

        console.log("=========== Creating Inputs ========")
        const swapPsbt = new bitcoin.Psbt()
        console.log("=========== Adding dummy utxos ========")
        
        for (let i = 0; i < 2; i++) {
            swapPsbt.addInput({
              hash: allUtxosWorth600[i].txid,
              index: allUtxosWorth600[i].vout,
              witnessUtxo: {
                value: allUtxosWorth600[i].value,
                script: Buffer.from(this.takerScript, 'hex'),
              },
              tapInternalKey: assertHex(Buffer.from(this.pubKey, 'hex')),
            })
          }
        
          console.log("=========== Fetching Maker Input Data ========")
          const makerInput = marketplacePsbt.txInputs[2]
          const makerInputData = marketplacePsbt.data.inputs[2]
          console.log("=========== Maker Input: ", makerInput)
          console.log("=========== Maker Input Data: ", makerInputData)
          swapPsbt.addInput({
            hash: makerInput.hash.toString('hex'),
            index: 0,
            witnessUtxo: {
              value: 546,
              script: makerInputData?.witnessUtxo?.script as Buffer,
            },
            tapInternalKey: makerInputData.tapInternalKey,
            tapKeySig: makerInputData.tapKeySig,
            sighashType:
              bitcoin.Transaction.SIGHASH_SINGLE |
              bitcoin.Transaction.SIGHASH_ANYONECANPAY,
          })

          console.log("=========== Adding available non ordinal UTXOS as input ========")
          console.log("=========== Retreived Utxos to add: ", retrievedUtxos)
          for (let i = 0; i < retrievedUtxos.length; i++) {
            swapPsbt.addInput({
              hash: retrievedUtxos[i].txid,
              index: retrievedUtxos[i].vout,
              witnessUtxo: {
                value: retrievedUtxos[i].value,
                script: Buffer.from(this.takerScript, 'hex'),
              },
              tapInternalKey: assertHex(Buffer.from(this.pubKey, 'hex')),
            })
          }

          console.log("=========== Done Inputs now adding outputs ============")
          swapPsbt.addOutput({
            address: this.walletAddress,
            value: 1200,
          })
          swapPsbt.addOutput({
            address: this.walletAddress,
            value: 546,
          })
          swapPsbt.addOutput({
            address: this.makersAddress,
            value: costPrice,
          })
          const amountRetrieved = this.calculateAmountGathered(retrievedUtxos)
          const remainder = amountRetrieved - costPrice - 30000 - 546 - 1200
          swapPsbt.addOutput({
            address: this.walletAddress,
            value: 600,
          })
          swapPsbt.addOutput({
            address: this.walletAddress,
            value: 600,
          })
          swapPsbt.addOutput({
            address: this.walletAddress,
            value: remainder,
          })
          console.log("=========== Returning PSBT Hex Value to be signed by taker ============")
          return swapPsbt.toHex()
    }


    async getAllUTXOsWorthASpecificValue(value: number) {
        const unspents = await this.getUnspentsWithConfirmationsForAddress()
        console.log("=========== Confirmed Utxos", unspents)
        return unspents.filter((utxo) => utxo.value === value)
    }

    calculateAmountGathered(utxoArray: any) {
        return utxoArray?.reduce((prev, currentValue) => prev + currentValue.value, 0)
      }

    async getUnspentsWithConfirmationsForAddress(
    ) {
        try {
            ("=========== Getting all confirmed utxos for " + this.walletAddress + " ============")
            return await this.esploraRpc.getAddressUtxo(this.walletAddress).then(
                (unspents) =>
                    unspents?.filter(
                        (utxo) => utxo.status.confirmed == true
                    ) 
            )
        } catch (e: any) {
            throw new Error(e)
        }
    }

    async getUnspentsForAddressInOrderByValue() {
        const unspents = await this.getUnspentsWithConfirmationsForAddress()
        console.log("=========== Confirmed Utxos", unspents)
        return unspents.sort((a, b) => b.value - a.value)
    }

    async getMakersAddress () {
        const swapTx = await this.sandshrewBtcClient.bitcoindRpc.decodePSBT(this.psbtBase64);
        const outputs = swapTx.tx.vout
        for (var i = 0; i < outputs.length; i++){
            if (outputs[i].value == this.orderPrice) {
                this.makersAddress = outputs[i].scriptPubKey.address
            }
        }
    }

}