import { Oyl, getAddressType, AddressType, OGPSBTTransaction } from "..";
import { BuildMarketplaceTransaction } from "./buildMarketplaceTx";
import * as bitcoin from "bitcoinjs-lib";
import { MarketplaceOffers } from "../shared/interface";

class Marketplace {
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
      network: this.wallet.network
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
    signedPsbt.finalizeAllInputs();
    psbtBase64s.push(signedPsbt.toBase64());
    const result =
      await this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(
        signedPsbt.toBase64()
      );
    psbtHexs.push(result.hex);
    const txId = signedPsbt.extractTransaction().getId();
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

  async buyMarketPlaceOffers(offers) {
    if (offers.length < 1) throw Error("No offers to buy");
  
    const marketPlaceBuy = new BuildMarketplaceTransaction({
      address: this.address,
      pubKey: this.publicKey,
      psbtBase64: offers[0].psbtBase64,
      price: offers[0].price,
      network: this.wallet.network
    });

    const preparedWallet = await this.prepareAddress(marketPlaceBuy)
    if (!preparedWallet) {
      throw new Error("Address not prepared to buy marketplace offers")
    }
    
    const estimatedCost = await this.getOffersCostEstimate(offers)
    const validateAffordability = await marketPlaceBuy.checkAffordability(estimatedCost)
    if (!validateAffordability){
      throw new Error("Address not have enough sats to buy marketplace offers, needs  "+ estimatedCost + " sats")
    }

    const { psbtBase64, remainder, psbtHex } =
      await marketPlaceBuy.psbtBuilder();
    const tempPsbt = bitcoin.Psbt.fromHex(psbtHex, {
      network: this.wallet.network,
    });
    const txSigner = await this.getSigner();
    const signedPsbt = await txSigner.signPsbt(tempPsbt, false);
    signedPsbt.finalizeAllInputs();
    const result =
      await this.wallet.sandshrewBtcClient.bitcoindRpc.finalizePSBT(
        signedPsbt.toBase64()
      );
    const [broadcast] =
      await this.wallet.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([result.hex]);

    if (!broadcast.allowed) {
      throw new Error(result['reject-reason'])
    }
    await this.wallet.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(result.hex)

    const txId = signedPsbt.extractTransaction().getId();
    let remainingSats = remainder;
    const multipleBuys = await this.processMultipleBuys(
      offers,
      txId,
      remainingSats,
      1
    );
    return {
      rootTx: txId,
      multipleBuys
    };
  }

  async processAllOffers(offers: MarketplaceOffers[]) {

    const processedOffers = []
    for (const offer of offers) {
      if (offer.marketplace == 'omnisat') {
        let newOffer = await this.wallet.apiClient.getOmnisatOfferPsbt({ offerId: offer.offerId, ticker: offer.ticker });

        processedOffers.push(newOffer);
      }
    }
    return processedOffers;
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
  async validateTxidInMempool(txid: string){

  }
}
