import {
  Oyl,
  getAddressType,
  AddressType,
  getNetwork,
  timeout,
  getSatpointFromUtxo,
} from '..'
import { BuildMarketplaceTransaction } from './buildMarketplaceTx'
import * as bitcoin from 'bitcoinjs-lib'
import {
  ExternalSwap,
  MarketplaceAccount,
  MarketplaceOffer,
  OkxBid,
} from '../shared/interface'
import { Signer } from '../signer';
import { genSignedBuyingPSBTWithoutListSignature, networks, BuyingData } from "@okxweb3/coin-bitcoin";
import { BIP322, Signer as bip322Signer, Verifier } from 'bip322-js';

export class Marketplace {
  private wallet: Oyl;
  private receiveAddress: string;
  private selectedSpendAddress: string | null;
  private selectedSpendPubkey: string | null;
  private spendAddress: string;
  private spendPubKey: string;
  private altSpendAddress: string;
  private altSpendPubKey: string;
  private signer: Signer;
  public feeRate: number;
  public addressesBound: boolean = false;

  constructor(options: MarketplaceAccount) {
      this.wallet = options.wallet;
      this.receiveAddress = options.receiveAddress;
      this.spendAddress = options.spendAddress;
      this.spendPubKey = options.spendPubKey;
      this.altSpendAddress = options.altSpendAddress;
      this.altSpendPubKey = options.altSpendPubKey;
      this.signer = options.signer;
      this.feeRate = options.feeRate;
  }


  /**
   * Should estimate the total amount of satoshi required to execute offers including fees
   **/
  async getOffersCostEstimate(offers: MarketplaceOffer[]) {
      let costEstimate = 0
      for (let i = 0; i < offers.length; i++) {
          //50000 represents total fees, 546 for dust provision, 1200 for dummy utxos
          let offerPrice = offers[i]?.price
              ? offers[i].price
              : offers[i]?.totalPrice
          costEstimate += offerPrice + 30000 + 546 + 1200
      }
      return costEstimate
  }


  async selectSpendAddress(offers: MarketplaceOffer[]) {
      const estimatedCost = await this.getOffersCostEstimate(offers)
      if (await this.canAddressAffordOffers(this.spendAddress, estimatedCost)) {
          this.selectedSpendAddress = this.spendAddress;
          this.selectedSpendPubkey = this.spendPubKey;
      } else if (await this.canAddressAffordOffers(this.altSpendAddress, estimatedCost)) {
          this.selectedSpendAddress = this.altSpendAddress;
          this.selectedSpendPubkey = this.altSpendPubKey;
      } else {
          throw new Error('Not enough sats available to buy marketplace offers, need  ' +
              estimatedCost + ' sats');
      }
  }

  async processMultipleBuys(
      orders,
      previousOrderTxId: string,
      remainingSats: number,
      index = 1,
      psbtBase64s: string[] = [],
      psbtHexs = [],
      txIds = []
    ) {
      if (index >= orders.length) {
        return { txIds, psbtHexs, psbtBase64s }
      }
      try {
        const order = orders[index]
        const marketPlaceBuy = new BuildMarketplaceTransaction({
          address: this.selectedSpendAddress,
          pubKey: this.selectedSpendPubkey,
          receiveAddress: this.receiveAddress,
          psbtBase64: order.psbtBase64,
          price: order.price,
          wallet: this.wallet,
        })
        const {
          psbtBase64: filledOutBase64,
          remainingSats: updatedRemainingSats,
        } = await marketPlaceBuy.psbtMultiBuilder(
          previousOrderTxId,
          remainingSats
        )
        const psbtPayload  = await this.signMarketplacePsbt(filledOutBase64, true)
        const result =
          await this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(
              psbtPayload.signedPsbt
          )
        const txPayload =
          await this.wallet.sandshrewBtcClient.bitcoindRpc.decodeRawTransaction(
            result.hex
          )
        const txId = txPayload.txid
  
        psbtHexs.push(result.hex)
        txIds.push(txId)
  
        return await this.processMultipleBuys(
          orders,
          txId,
          updatedRemainingSats,
          index + 1,
          psbtBase64s,
          psbtHexs,
          txIds
        )
      } catch (error) {
        //skip to the next if an error occurs
        return await this.processMultipleBuys(
          orders,
          previousOrderTxId,
          remainingSats,
          index + 1,
          psbtBase64s,
          psbtHexs,
          txIds
        )
      }
    }

  async signMarketplacePsbt(psbt: string, finalize: boolean = false) {
      const spendAddressType = getAddressType(this.selectedSpendAddress);
      let payload;
      switch (spendAddressType) {
          case AddressType.P2TR: {
               payload = await this.signer.signAllTaprootInputs({
                  rawPsbt: psbt,
                  finalize,
                })
            break;
          }
          case AddressType.P2WPKH: {
               payload = await this.signer.signAllSegwitInputs({
                  rawPsbt: psbt,
                  finalize,
                })
            break;
          }
        }
        return payload;
    }


  async processAllOffers(offers: MarketplaceOffer[]) {
      await this.selectSpendAddress(offers)
      const processedOffers = []
      let externalSwap = false
      const testnet = this.wallet.network == getNetwork('testnet')
      for (const offer of offers) {
          if (offer.marketplace == 'omnisat') {
              let newOffer = await this.wallet.apiClient.getOmnisatOfferPsbt({
                  offerId: offer.offerId,
                  ticker: offer.ticker,
                  testnet,
              })
              if (newOffer != false) {
                  processedOffers.push(newOffer)
              }
          } else if (offer.marketplace == 'unisat' && !testnet) {
              let txId = await this.externalSwap({
                auctionId: offer.offerId,
                bidPrice: offer.totalPrice,
              })
              if (txId != null) processedOffers.push(txId)
              externalSwap = true
              await timeout(2000)
          } else if (offer.marketplace == 'okx' && !testnet) {
            console.log("offer", offer)
              const offerPsbt = await this.wallet.apiClient.getOkxOfferPsbt({offerId: offer.offerId});
              const signedPsbt = await this.createOkxSignedPsbt(offerPsbt.data.sellerPsbt, offer.totalPrice);
              const payload: OkxBid = {
                  ticker: offer.ticker,
                  amount: parseInt(offer.amount),
                  fromAddress: this.selectedSpendAddress,
                  toAddress: offer.address,
                  inscriptionId: offer.inscriptionId,
                  buyerPsbt: signedPsbt,
                  orderId: offer.offerId
              }
              const tx = await this.wallet.apiClient.submitOkxBid(payload);
              console.log("tx", tx)
              let txId = tx?.data;
              if (txId != null) processedOffers.push(txId)
              externalSwap = true
          }
      }
      if (processedOffers.length < 1) {
          throw new Error('Offers  unavailable')
      }
      return {
          processed: externalSwap,
          processedOffers,
      }
  }

  async externalSwap(bid: ExternalSwap) {
      const payload = {
        address: this.selectedSpendAddress,
        auctionId: bid.auctionId,
        bidPrice: bid.bidPrice,
        pubKey: this.selectedSpendPubkey,
        receiveAddress: this.receiveAddress
      }
      if (this.selectedSpendAddress != this.receiveAddress && !this.addressesBound){
        const signature = await this.getSignatureForBind();
        payload["signature"] = signature
        this.addressesBound = true;
      }
      const psbt = await this.wallet.apiClient.initSwapBid(payload)
      if (!psbt?.error) {
        const unsignedPsbt = psbt.psbtBid
  
        const swapOptions = bid
        swapOptions['psbt'] = unsignedPsbt
  
        const signedPsbt = await this.externalSign(swapOptions)
        const data = await this.wallet.apiClient.submitSignedBid({
          psbtBid: signedPsbt,
          auctionId: bid.auctionId,
          bidId: psbt.bidId,
        })
        if (data.txid) return data.txid
      }
      return null
    }

  async buyMarketPlaceOffers(pOffers) {
      if (pOffers.processed) {
        return pOffers.processedOffers
      }
      const offers = pOffers.processedOffers
      if (offers.length < 1) throw Error('No offers to buy')
  
      const marketPlaceBuy = new BuildMarketplaceTransaction({
          address: this.selectedSpendAddress,
          pubKey: this.selectedSpendPubkey,
          receiveAddress: this.receiveAddress,
          psbtBase64: offers[0].psbtBase64,
          price: offers[0].price,
          wallet: this.wallet,
      })
  
      const preparedWallet = await this.prepareAddress(marketPlaceBuy)
      await timeout(30000)
      if (!preparedWallet) {
        throw new Error('Address not prepared to buy marketplace offers')
      }
  
      const { psbtBase64, remainder } =
        await marketPlaceBuy.psbtBuilder()
      const psbtPayload = await this.signMarketplacePsbt(psbtBase64, true)
      const result =
        await this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(
          psbtPayload.signedPsbt
        )
      const [broadcast] =
        await this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
          result.hex,
        ])
  
      if (!broadcast.allowed) {
        console.log('in buyMarketPlaceOffers', broadcast)
        throw new Error(result['reject-reason'])
      }
      await this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(
        result.hex
      )
      const txPayload =
        await this.wallet.sandshrewBtcClient.bitcoindRpc.decodeRawTransaction(
          result.hex
        )
      const txId = txPayload.txid
      let remainingSats = remainder
      const multipleBuys = await this.processMultipleBuys(
        offers,
        txId,
        remainingSats,
        1
      )
      const marketplaceTxns = []
      marketplaceTxns.push(txId)
  
      for (let i = 0; i < multipleBuys.psbtHexs.length; i++) {
        await timeout(30000)
        const [broadcast] =
          await this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
            multipleBuys.psbtHexs[i],
          ])
        if (!broadcast.allowed) {
          console.log('Error in broadcasting tx: ' + multipleBuys.txIds[i])
          console.log(broadcast)
          console.log(result['reject-reason'])
          return {
            marketplaceTxns,
          }
        }
        await this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(
          multipleBuys.psbtHexs[i]
        )
        marketplaceTxns.push(multipleBuys.txIds[i])
      }
      return {
        marketplaceTxns,
      }
    }


  async prepareAddress(
      marketPlaceBuy: BuildMarketplaceTransaction
    ): Promise<Boolean> {
      try {
        const prepared = await marketPlaceBuy.isWalletPrepared()
        if (!prepared) {
          const { psbtBase64 } = await marketPlaceBuy.prepareWallet()
          const psbtPayload = await this.signMarketplacePsbt(psbtBase64, true)
          const result =
            await this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(
              psbtPayload.signedPsbt
            )
          const [broadcast] =
            await this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
              result.hex,
            ])
  
          if (!broadcast.allowed) {
            console.log('in prepareAddress', broadcast)
            throw new Error(result['reject-reason'])
          }
          await this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(
            result.hex
          )
          return true
        }
        return true
      } catch (err) {
        console.log('Error', err)
        throw Error(
          'An error occured while preparing address for marketplace buy'
        )
      }
    }

    
  async canAddressAffordOffers(address: string, estimatedCost: number) {
      const retrievedUtxos = await this.getUTXOsToCoverAmount(address, estimatedCost);
      return retrievedUtxos.length > 0;
  }

  async externalSign(options) {    
      const psbt = bitcoin.Psbt.fromHex(options.psbt, {
        network: this.wallet.network,
      })
      const psbtPayload = await this.signMarketplacePsbt(psbt.toBase64(), false)    
      return psbtPayload.signedHexPsbt
    }

  async getUnspentsForAddress(address: string) {
      try {
          '=========== Getting all confirmed/unconfirmed utxos for ' +
              address +
              ' ============'
          return await this.wallet.esploraRpc
              .getAddressUtxo(address)
              .then((unspents) => unspents?.filter((utxo) => utxo.value > 546))
      } catch (e: any) {
          throw new Error(e)
      }
  }

  async getUnspentsForAddressInOrderByValue(address: string) {
      const unspents = await this.getUnspentsForAddress(address)
      console.log('=========== Confirmed Utxos len', unspents.length)
      return unspents.sort((a, b) => b.value - a.value)
  }

  async getUTXOsToCoverAmount(
      address: string,
      amountNeeded: number,
      excludedUtxos = [],
      inscriptionLocs?: string[]
  ) {
      try {
          console.log(
              '=========== Getting Unspents for address in order by value ========'
          )
          const unspentsOrderedByValue =
              await this.getUnspentsForAddressInOrderByValue(address)
          console.log('unspentsOrderedByValue len:', unspentsOrderedByValue.length)
          console.log(
              '=========== Getting Collectibles for address ' +
              address +
              '========'
          )
          const retrievedIxs = (
              await this.wallet.apiClient.getCollectiblesByAddress(address)
          ).data
          console.log('=========== Collectibles:', retrievedIxs.length)
          console.log('=========== Gotten Collectibles, splitting utxos ========')
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
          for await (let utxo of unspentsOrderedByValue) {
            if (this.isExcludedUtxo(utxo, excludedUtxos)) { // Check if the UTXO should be excluded
              continue;
            }
              const currentUTXO = utxo
              const utxoSatpoint = getSatpointFromUtxo(currentUTXO)
              if (
                  (inscriptionLocs &&
                      inscriptionLocs?.find(
                          (utxoLoc: any) => utxoLoc === utxoSatpoint
                      )) ||
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
      } catch (e: any) {
          throw new Error(e)
      }
  }

  async getAllUTXOsWorthASpecificValue(value: number) {
    const unspents = await this.getUnspentsForAddress(this.selectedSpendAddress)
    console.log('=========== Confirmed/Unconfirmed Utxos Len', unspents.length)
    return unspents.filter((utxo) => utxo.value === value)
  }

  async buildDummyAndPaymentUtxos (orderPrice: number){
    const allUtxosWorth600 = await this.getAllUTXOsWorthASpecificValue(600)
    if (allUtxosWorth600.length < 2) {
      throw Error('not enough padding utxos (600 sat) for marketplace buy')
    }

    const dummyUtxos = []
    for (let i = 0; i < 2; i++) {
      dummyUtxos.push({
        txHash: allUtxosWorth600[i].txid,
        vout: allUtxosWorth600[i].vout,
        coinAmount: allUtxosWorth600[i].value
      });
    }

    const requiredSatoshis = orderPrice + 3000 + 546 
    const retrievedUtxos = await this.getUTXOsToCoverAmount(this.selectedSpendAddress, requiredSatoshis, dummyUtxos)
    if (retrievedUtxos.length === 0) {
      throw Error('Not enough funds to purchase this offer')
    }

    const paymentUtxos = []
    retrievedUtxos.forEach((utxo) => {
      paymentUtxos.push({
        txHash: utxo.txid,
        vout: utxo.vout,
        coinAmount: utxo.value,
      });
    });

    return {
      dummyUtxos,
      paymentUtxos
    }
  }

  async createOkxSignedPsbt (sellerPsbt: string, orderPrice: number) {
    const marketPlaceBuy = new BuildMarketplaceTransaction({
      address: this.selectedSpendAddress,
      pubKey: this.selectedSpendPubkey,
      receiveAddress: this.receiveAddress,
      psbtBase64: "",
      price: 0,
      wallet: this.wallet,
  })
  const preparedWallet = await this.prepareAddress(marketPlaceBuy)
  await timeout(30000)
  if (!preparedWallet) {
    throw new Error('Address not prepared to buy marketplace offers')
  }
    const keyPair = (getAddressType(this.selectedSpendAddress) == AddressType.P2WPKH) ? this.signer.segwitKeyPair : this.signer.taprootKeyPair
    const privateKey = keyPair.toWIF();
    const data = await this.buildDummyAndPaymentUtxos(orderPrice) as any;
    data["receiveNftAddress"] = this.receiveAddress;
    data["paymentAndChangeAddress"] = this.selectedSpendAddress;
    data["feeRate"] = this.feeRate;
    data["sellerPsbts"] = [sellerPsbt]
    const buyingData: BuyingData = data

    const buyerPsbt = genSignedBuyingPSBTWithoutListSignature(buyingData, privateKey, networks.bitcoin);
    return buyerPsbt
  }

  isExcludedUtxo(utxo, excludedUtxos) {
    return excludedUtxos.some(excluded => excluded.txHash === utxo.txid && excluded.vout === utxo.vout);
}

  async getSignatureForBind(){
    const message = `Please confirm that\nPayment Address: ${this.selectedSpendAddress}\nOrdinals Address: ${this.receiveAddress}`
    if (getAddressType(this.receiveAddress) == AddressType.P2WPKH){
      const keyPair = this.signer.segwitKeyPair;
      const privateKey = keyPair.toWIF()
      const signature = bip322Signer.sign( privateKey, this.receiveAddress, message); 
      return signature.toString('base64')
    } else if (getAddressType(this.receiveAddress) == AddressType.P2TR){
      const keyPair =  this.signer.taprootKeyPair;
      const privateKey = keyPair.toWIF()
      const signature = bip322Signer.sign( privateKey, this.receiveAddress, message); 
      return signature.toString('base64')
    }
  }
}




















