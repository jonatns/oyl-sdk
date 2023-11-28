import { MarketplaceOffer } from "../shared/interface";
export declare class Aggregator {
    apiClient: any;
    constructor();
    /**
     * Fetches offers from all APIs and aggregates them.
     */
    fetchAndAggregateOffers(ticker: any, limitOrderAmount: any, ordiMarketPrice: any): Promise<void>;
    /**
     * Fetches offers from all external marketplaces.
     */
    _fetchAllOffers(ticker: string): Promise<MarketplaceOffer[]>;
    /**
     * Aggregates offers based on the provided specifications.
     */
    _aggregateOffers(offers: any, limitOrderAmount: any, ordiMarketPrice: any): void;
    /**
     * Finds the best offer based on the limit order amount and market price.
     */
    _findBestOffer(offers: any, limitOrderAmount: any, ordiMarketPrice: any): void;
}
