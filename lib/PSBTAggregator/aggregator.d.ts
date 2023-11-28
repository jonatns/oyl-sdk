export declare class Aggregator {
    apiClients: any;
    constructor(apiClients: any);
    /**
     * Fetches offers from all APIs and aggregates them.
     */
    fetchAndAggregateOffers(limitOrderAmount: any, ordiMarketPrice: any): Promise<void>;
    /**
     * Fetches offers from all external marketplaces.
     */
    _fetchAllOffers(): Promise<void>;
    /**
     * Aggregates offers based on the provided specifications.
     */
    _aggregateOffers(offers: any, limitOrderAmount: any, ordiMarketPrice: any): void;
    /**
     * Finds the best offer based on the limit order amount and market price.
     */
    _findBestOffer(offers: any, limitOrderAmount: any, ordiMarketPrice: any): void;
}
