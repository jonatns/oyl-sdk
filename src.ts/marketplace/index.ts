import { Oyl, getAddressType, AddressType, OGPSBTTransaction, getNetwork, timeout } from "..";
import { BuildMarketplaceTransaction } from "./buildMarketplaceTx";
import * as bitcoin from "bitcoinjs-lib";
import { ExternalSwap, MarketplaceOffer, MarketplaceOffers } from "../shared/interface";

export class Marketplace {
  private wallet: Oyl;
  public address: string;
  public publicKey: string;
  private mnemonic: string;
  private hdPath: string;
  public feeRate: number;
  public addressType: AddressType;

  constructor(options?) {
    try {
      this.wallet = options.wallet;
      this.address = options.address;
      this.publicKey = options.publicKey;
      this.mnemonic = options.mnemonic;
      this.feeRate = options.feeRate;
      this.hdPath = options.hdPath;
      const addressType = getAddressType(this.address);
      if (addressType == null) throw Error("Invalid Address Type");
      this.addressType = addressType;
    } catch (e) {
      throw Error("An error occured: \n" + e);
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
      return { txIds, psbtHexs, psbtBase64s };
    }
    const order = orders[index];
    const marketPlaceBuy = new BuildMarketplaceTransaction({
      address: this.address,
      pubKey: this.publicKey,
      psbtBase64: order.psbtBase64,
      price: order.price,
      wallet: this.wallet
    });
    const {
      psbtBase64: filledOutBase64,
      remainingSats: updatedRemainingSats,
      psbtHex: filledOutPsbtHex,
    } = await marketPlaceBuy.psbtMultiBuilder(previousOrderTxId, remainingSats);
    const tempPsbt = bitcoin.Psbt.fromHex(filledOutPsbtHex, {
      network: this.wallet.network,
    });
    const txSigner = await this.getSigner();
    const signedPsbt = await txSigner.signPsbt(tempPsbt, false);
    const result =
      await this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(
        signedPsbt.toBase64()
      );
    psbtHexs.push(result.hex);
    const txPayload = await this.wallet.sandshrewBtcClient.bitcoindRpc.decodeRawTransaction(result.hex)
    const txId = txPayload.txid;
    txIds.push(txId);
    return await this.processMultipleBuys(
      orders,
      txId,
      updatedRemainingSats,
      index + 1,
      psbtBase64s,
      psbtHexs,
      txIds
    );
  }

  async getSigner() {
    const payload = await this.wallet.fromPhrase({
      mnemonic: this.mnemonic.trim(),
      hdPath: this.hdPath,
      addrType: this.addressType,
    });
    console.log(payload.keyring.address)
    if (payload.keyring.address != this.address)
      throw Error("Could not get signer for this address");
    const keyring = payload.keyring.keyring;
    const signer = keyring.signTransaction.bind(keyring);
    const tx = new OGPSBTTransaction(
      signer,
      this.address,
      this.publicKey,
      this.addressType,
      this.wallet.network,
      this.feeRate
    );
    return tx;
  }

  async buyMarketPlaceOffers(pOffers) {
    if (pOffers.processed){
      return pOffers.processedOffers
    }
    const offers = pOffers.processedOffers
    if (offers.length < 1) throw Error("No offers to buy");

    const marketPlaceBuy = new BuildMarketplaceTransaction({
      address: this.address,
      pubKey: this.publicKey,
      psbtBase64: offers[0].psbtBase64,
      price: offers[0].price,
      wallet: this.wallet
    });

    const preparedWallet = await this.prepareAddress(marketPlaceBuy)
    await timeout(30000)
    if (!preparedWallet) {
      throw new Error("Address not prepared to buy marketplace offers")
    }

    const estimatedCost = await this.getOffersCostEstimate(offers)
    const validateAffordability = await marketPlaceBuy.checkAffordability(estimatedCost)
    if (!validateAffordability) {
      throw new Error("Address not have enough sats to buy marketplace offers, needs  " + estimatedCost + " sats")
    }

    const { psbtBase64, remainder, psbtHex } =
      await marketPlaceBuy.psbtBuilder();
    const tempPsbt = bitcoin.Psbt.fromHex(psbtHex, {
      network: this.wallet.network,
    });
    const txSigner = await this.getSigner();
    const signedPsbt = await txSigner.signPsbt(tempPsbt, false);
    const result =
      await this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(
        signedPsbt.toBase64()
      );
    const [broadcast] =
      await this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([result.hex]);

    if (!broadcast.allowed) {
      console.log("in buyMarketPlaceOffers", broadcast)
      throw new Error(result['reject-reason'])
    }
    await this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(result.hex)
    const txPayload = await this.wallet.sandshrewBtcClient.bitcoindRpc.decodeRawTransaction(result.hex)
    const txId = txPayload.txid;
    let remainingSats = remainder;
    const multipleBuys = await this.processMultipleBuys(
      offers,
      txId,
      remainingSats,
      1
    );
    for (let i = 0; i < multipleBuys.psbtHexs.length; i++) {
      await timeout(30000)
      const [broadcast] =
        await this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([multipleBuys.psbtHexs[i]])
      if (!broadcast.allowed) {
        console.log("in broadcasting multiple buys", broadcast)
        throw new Error(result['reject-reason'])
      }
      await this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(multipleBuys.psbtHexs[i])
    }
    const marketplaceTxns = []
    marketplaceTxns.push(txId);
    const subsequentTxids = multipleBuys.txIds
    for(let i = 0; i < subsequentTxids.length; i++){
      marketplaceTxns.push(subsequentTxids[i]);
    }
    return {
      marketplaceTxns
    };
  }

  async processAllOffers(offers: MarketplaceOffer[]) {

    const processedOffers = []
    let externalSwap = false
    const testnet = this.wallet.network == getNetwork('testnet');
    for (const offer of offers) {
      if (offer.marketplace == 'omnisat') {
        let newOffer = await this.wallet.apiClient.getOmnisatOfferPsbt({ offerId: offer.offerId, ticker: offer.ticker, testnet });
        if (newOffer == false) {
          throw new Error("cannot find offer")
        }
        processedOffers.push(newOffer);
      } else if (offer.marketplace == 'unisat' && !testnet){
        let txId = await this.externalSwap({
          address: this.address, 
          auctionId: offer.offerId,
          bidPrice: offer.totalPrice,
          pubKey: this.publicKey,
          mnemonic: this.mnemonic,
          hdPath: this.hdPath,
          type: this.addressType
        })
        processedOffers.push(txId)
        externalSwap = true
        await timeout(5000)
      }
    }
    return {
      processed: externalSwap,
      processedOffers
    };
  }

  async externalSwap(bid: ExternalSwap) {
    const psbt = await this.wallet.apiClient.initSwapBid({
      address: bid.address,
      auctionId: bid.auctionId,
      bidPrice: bid.bidPrice,
      pubKey: bid.pubKey
    })
    console.log(psbt)
    if (psbt.error) throw new Error("cannot find offer");
    const unsignedPsbt = psbt.psbtBid;
    const feeRate = psbt.feeRate;

    const swapOptions = bid;
    swapOptions["psbt"] = unsignedPsbt;
    swapOptions["feeRate"] = feeRate;
    swapOptions["indexToSign"] = psbt.bidSignIndexes

    const signedPsbt = await this.externalSign(swapOptions);

    const data = await this.wallet.apiClient.submitSignedBid({
      psbtBid: signedPsbt,
      auctionId: bid.auctionId,
      bidId: psbt.bidId
    });
    return data.txid;

  }

  async externalSign(options) {
    const address = options.address;
    const feeRate = options.feeRate;
    const mnemonic = options.mnemonic;
    const pubKey = options.pubKey;

    const psbt = bitcoin.Psbt.fromHex(options.psbt, { network: bitcoin.networks.bitcoin });
    const payload = await this.wallet.fromPhrase({
      mnemonic: mnemonic.trim(),
      hdPath: options.hdPath,
      addrType: options.type
    })

    const keyring = payload.keyring.keyring;
    const signer = keyring.signTransaction.bind(keyring);
    const from = address;
    const addressType = getAddressType(from)
    if (addressType == null) throw Error("Invalid Address Type");

    const tx = new OGPSBTTransaction(
      signer,
      from,
      pubKey,
      addressType,
      this.wallet.network,
      feeRate
    );

    const psbt_ = await tx.signPsbt(psbt, false, false, options.indexToSign)

    return psbt_.toHex();
  }

  /**
   * should be able to check if an offer is still valid on the external marketplace
    should make request to the api (and force a refetch of the orderId
  **/
  async checkIfOfferIsValid(offer): Promise<Boolean> {

    return false;
  }

  /**
   * Should regularize an address in the event an address doesn't have
   required utxos for a psbt atomic swap
   */
  async prepareAddress(marketPlaceBuy: BuildMarketplaceTransaction): Promise<Boolean> {

    try {
      const prepared = await marketPlaceBuy.isWalletPrepared();
      if (!prepared) {
        const { psbtHex } = await marketPlaceBuy.prepareWallet();
        const tempPsbt = bitcoin.Psbt.fromHex(psbtHex, {
          network: this.wallet.network,
        });
        const txSigner = await this.getSigner();
        const signedPsbt = await txSigner.signPsbt(tempPsbt, false);
        signedPsbt.finalizeAllInputs();
        const result = await this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(
          signedPsbt.toBase64()
        );
        const [broadcast] =
          await this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([result.hex])

        if (!broadcast.allowed) {
          console.log("in prepareAddress", broadcast)
          throw new Error(result['reject-reason'])
        }
        await this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(result.hex)
        return true
      }
      return true
    } catch (err) {
      console.log("Error", err)
      throw Error("An error occured while preparing address for marketplace buy")
    }
  }

  /**
   * Should estimate the total amount of satoshi required to execute offers including fees
   **/
  async getOffersCostEstimate(offers) {
    let costEstimate = 0;
    for (let i = 0; i < offers.length; i++) {
      //30000 represents fee rate, 546 for dust
      costEstimate += offers[i].price + 30000 + 546
    }
    return costEstimate;
  }

  /**
   * Should validate the txid is in the mempool
   **/
  async validateTxidInMempool(txid: string) {

  }
}
