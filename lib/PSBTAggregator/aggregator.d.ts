import { MarketplaceOffer } from "../shared/interface";
export declare class Aggregator {
    apiClient: any;
    offers: any;
    constructor();
    /**
     * Fetches offers from all APIs and aggregates them.
     */
    fetchAndAggregateOffers(ticker: any, limitOrderAmount: any, ordiMarketPrice: any): Promise<{
        bestPrice: {
            averagePrice: number;
            totalPrice: any;
            offers: any;
        };
        closestMatch: {
            averagePrice: number;
            totalPrice: any;
            offers: any;
        };
    }>;
    /**
     * Fetches offers from all external marketplaces.
     */
    _fetchAllOffers(ticker: string): Promise<MarketplaceOffer[]>;
    findBestAndClosestMatches(offers: any, targetAmount: any, marketPrice: any): Promise<{
        bestPrice: {
            averagePrice: number;
            totalPrice: any;
            offers: any;
        };
        closestMatch: {
            averagePrice: number;
            totalPrice: any;
            offers: any;
        };
    }>;
    sumAmounts(indices: any, offers: any): any;
    sumTotalPrice(indices: any, offers: any): any;
    findSolutionsWithinRange(costs: any, weights: any, minWeightLimit: any, maxWeightLimit: any): Promise<any[]>;
}
