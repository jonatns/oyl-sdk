import { BuildMarketplaceTransaction } from './buildMarketplaceTx';
import { ExternalSwap, MarketplaceAccount, MarketplaceOffer } from '../shared/interface';
export declare class Marketplace {
    private wallet;
    private receiveAddress;
    private selectedSpendAddress;
    private selectedSpendPubkey;
    private spendAddress;
    private spendPubKey;
    private altSpendAddress;
    private altSpendPubKey;
    private signer;
    feeRate: number;
    addressesBound: boolean;
    constructor(options: MarketplaceAccount);
    /**
     * Should estimate the total amount of satoshi required to execute offers including fees
     **/
    getOffersCostEstimate(offers: MarketplaceOffer[]): Promise<number>;
    selectSpendAddress(offers: MarketplaceOffer[]): Promise<void>;
    processMultipleBuys(orders: any, previousOrderTxId: string, remainingSats: number, index?: number, psbtBase64s?: string[], psbtHexs?: any[], txIds?: any[]): any;
    signMarketplacePsbt(psbt: string, finalize?: boolean): Promise<any>;
    processAllOffers(offers: MarketplaceOffer[]): Promise<{
        processed: boolean;
        processedOffers: any[];
    }>;
    externalSwap(bid: ExternalSwap): Promise<any>;
    buyMarketPlaceOffers(pOffers: any): Promise<any>;
    prepareAddress(marketPlaceBuy: BuildMarketplaceTransaction): Promise<Boolean>;
    canAddressAffordOffers(address: string, estimatedCost: number): Promise<boolean>;
    externalSign(options: any): Promise<any>;
    getUnspentsForAddress(address: string): Promise<any>;
    getUnspentsForAddressInOrderByValue(address: string): Promise<any>;
    getUTXOsToCoverAmount(address: string, amountNeeded: number, inscriptionLocs?: string[]): Promise<any>;
    getSignatureForBind(): Promise<string>;
}
