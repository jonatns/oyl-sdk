import { IBlockchainInfoUTXO } from "../shared/interface";
import { OylApiClient } from '../apiclient'
import {SandshrewBitcoinClient }from '../rpclient/sandshrew'
import { EsploraRpc } from "../rpclient/esplora";
import { assertHex, getSatpointFromUtxo } from "../shared/utils";
import * as bitcoin from 'bitcoinjs-lib'


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


    constructor({ address, pubKey, feeRate, psbtBase64, price }: { address: string, pubKey: string, feeRate: number, psbtBase64: string, price: number }) {
        this.walletAddress = address;
        this.pubKey = pubKey;
        this.apiClient = new OylApiClient({ host: 'https://api.oyl.gg' })
        this.esploraRpc = new EsploraRpc("https://mainnet.sandshrew.io/v1/154f9aaa25a986241357836c37f8d71")
        this.sandshrewBtcClient = new SandshrewBitcoinClient("https://sandshrew.io/v1/d6aebfed1769128379aca7d215f0b689");
        this.feeRate = feeRate
        this.psbtBase64 = psbtBase64
        this.orderPrice = price
    }


    async getUTXOsToCoverAmount(
        amountNeeded: number,
        inscriptionLocs?: string[]
    ) {
        const unspentsOrderedByValue = await this.getUnspentsForAddressInOrderByValue()
        const retrievedIxs = await this.apiClient.getCollectiblesByAddress(this.walletAddress)
        const bisInscriptionLocs = retrievedIxs.map(
            (utxo) => utxo.satpoint
        ) as string[]

        if (bisInscriptionLocs.length === 0) {
            inscriptionLocs = []
        } else {
            inscriptionLocs = bisInscriptionLocs
        }

        let sum = 0
        const result: IBlockchainInfoUTXO[] = []

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

        return [] as IBlockchainInfoUTXO[]
    }

    async psbtBuilder() {
        const marketplacePsbt = bitcoin.Psbt.fromBase64(this.psbtBase64)
        const costPrice = this.orderPrice * 100000000
        const requiredSatoshis = (costPrice) + 30000 + 546 + 1200
        const retrievedUtxos = await this.getUTXOsToCoverAmount(
            requiredSatoshis
        )
        if (retrievedUtxos.length === 0) {
            throw Error("Not enough funds to purchase this offer")
        }

        const allUtxosWorth600 = await this.getAllUTXOsWorthASpecificValue(600)
        if (allUtxosWorth600.length < 2) {
            throw Error("not enough padding utxos (600 sat) for marketplace buy")
        }

        await this.getMakersAddress()
        if (!this.makersAddress){
            throw Error("Could not resolve maker's address")
        }

        const swapPsbt = new bitcoin.Psbt()
        for (let i = 0; i < 2; i++) {
            swapPsbt.addInput({
              hash: allUtxosWorth600[i].tx_hash_big_endian,
              index: allUtxosWorth600[i].tx_output_n,
              witnessUtxo: {
                value: allUtxosWorth600[i].value,
                script: Buffer.from(allUtxosWorth600[i].script, 'hex'),
              },
              tapInternalKey: assertHex(Buffer.from(this.pubKey, 'hex')),
            })
          }

          const takerInput = marketplacePsbt.txInputs[2]
          const takerInputData = marketplacePsbt.data.inputs[2]
          swapPsbt.addInput({
            hash: takerInput.hash.toString('hex'),
            index: 0,
            witnessUtxo: {
              value: 546,
              script: takerInputData?.witnessUtxo?.script as Buffer,
            },
            tapInternalKey: takerInputData.tapInternalKey,
            tapKeySig: takerInputData.tapKeySig,
            sighashType:
              bitcoin.Transaction.SIGHASH_SINGLE |
              bitcoin.Transaction.SIGHASH_ANYONECANPAY,
          })

          for (let i = 0; i < retrievedUtxos.length; i++) {
            swapPsbt.addInput({
              hash: retrievedUtxos[i].tx_hash_big_endian,
              index: retrievedUtxos[i].tx_output_n,
              witnessUtxo: {
                value: retrievedUtxos[i].value,
                script: Buffer.from(retrievedUtxos[0].script, 'hex'),
              },
              tapInternalKey: assertHex(Buffer.from(this.pubKey, 'hex')),
            })
          }

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
    }


    async getAllUTXOsWorthASpecificValue(value: number) {
        const unspents = await this.getUnspentsWithConfirmationsForAddress()
        return unspents.filter((utxo) => utxo.value === value)
    }

    calculateAmountGathered(utxoArray: IBlockchainInfoUTXO[]) {
        return utxoArray?.reduce((prev, currentValue) => prev + currentValue.value, 0)
      }

    async getUnspentsWithConfirmationsForAddress(
    ) {
        try {
            return await this.esploraRpc.getAddressUtxo(this.walletAddress).then(
                (unspents) =>
                    unspents?.filter(
                        (utxo: IBlockchainInfoUTXO) => utxo.confirmations >= 0
                    ) as IBlockchainInfoUTXO[]
            )
        } catch (e: any) {
            throw new Error(e)
        }
    }

    async getUnspentsForAddressInOrderByValue() {
        const unspents = await this.getUnspentsWithConfirmationsForAddress()
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