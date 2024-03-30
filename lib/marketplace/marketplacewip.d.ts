import { MarketplaceAccount, MarketplaceOffer } from '../shared/interface';
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
    constructor(options: MarketplaceAccount);
    /**
     * Should estimate the total amount of satoshi required to execute offers including fees
     **/
    getOffersCostEstimate(offers: MarketplaceOffer[]): Promise<number>;
    selectSpendAddress(offers: MarketplaceOffer[]): Promise<void>;
    processAllOffers(offers: MarketplaceOffer[]): Promise<{
        processed: boolean;
        processedOffers: any[];
    }>;
    canAddressAffordOffers(address: string, estimatedCost: number): Promise<boolean>;
    getUnspentsForAddress(address: string): Promise<any>;
    getUnspentsForAddressInOrderByValue(address: string): Promise<any>;
    getUTXOsToCoverAmount(address: string, amountNeeded: number, inscriptionLocs?: string[]): Promise<any>;
}
