import { AddressType, OGPSBTTransaction } from "..";
import { BuildMarketplaceTransaction } from "./buildMarketplaceTx";
import { MarketplaceOffers } from "../shared/interface";
export declare class Marketplace {
    private wallet;
    address: string;
    publicKey: string;
    private mnemonic;
    private hdPath;
    feeRate: number;
    addressType: AddressType;
    constructor(options?: any);
    processMultipleBuys(orders: any, previousOrderTxId: string, remainingSats: number, index?: number, psbtBase64s?: string[], psbtHexs?: any[], txIds?: any[]): any;
    getSigner(): Promise<OGPSBTTransaction>;
    buyMarketPlaceOffers(offers: any): Promise<{
        rootTx: string;
        multipleBuys: any;
    }>;
    processAllOffers(offers: MarketplaceOffers[]): Promise<any[]>;
    /**
     * should be able to check if an offer is still valid on the external marketplace
      should make request to the api (and force a refetch of the orderId
    **/
    checkIfOfferIsValid(offer: any): Promise<Boolean>;
    /**
     * Should regularize an address in the event an address doesn't have
     required utxos for a psbt atomic swap
     */
    prepareAddress(marketPlaceBuy: BuildMarketplaceTransaction): Promise<Boolean>;
    /**
     * Should estimate the total amount of satoshi required to execute offers including fees
     **/
    getOffersCostEstimate(offers: any): Promise<number>;
    /**
     * Should validate the txid is in the mempool
     **/
    validateTxidInMempool(txid: string): Promise<void>;
}
