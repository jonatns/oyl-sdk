import { OylApiClient } from "../apiclient"
import { MarketplaceOffer } from "../shared/interface";

export class Aggregator {
    public apiClient

    constructor() {
        this.apiClient = new OylApiClient({ host: 'https://api.oyl.gg' })
    }

    /**
     * Fetches offers from all APIs and aggregates them.
     */
    async fetchAndAggregateOffers(ticker, limitOrderAmount, ordiMarketPrice) {
        // 1. Fetch offers from all APIs
        //   const offers = await this._fetchAllOffers(ticker);

        // 2. Aggregate offers based on the specifications
        //   return this._aggregateOffers(offers, limitOrderAmount, ordiMarketPrice);
    }

    /**
     * Fetches offers from all external marketplaces.
     */
    async _fetchAllOffers(ticker: string): Promise<MarketplaceOffer[]> {
    try {
        const allOffers = [];

        const okxOffers = await this.apiClient.getOkxTickerOffers({ ticker });
        for (const offer of okxOffers) {
            allOffers.push({
                ticker: offer.ticker,
                offerId: offer.nftId,
                amount: offer.amount,
                address: offer.ownerAddress,
                marketplace: "okx",
                unitPrice: parseFloat(offer.unitPrice.satPrice),
                totalPrice: parseFloat(offer.totalPrice.satPrice)
            });
        }
        const unisatOffers = await this.apiClient.getUnisatTickerOffers({ ticker });
        for (const offer of unisatOffers) {
            allOffers.push({
                ticker: offer.tick, 
                offerId: offer.auctionId,
                amount: offer.amount.toString(), 
                address: offer.address,
                marketplace: "unisat",
                unitPrice: offer.unitPrice,
                totalPrice: offer.price 
            });
        }
    
        return allOffers;
    } catch (error) {
        throw Error ("An error occured while fetching offers")
    }
    }
    

    /**
     * Aggregates offers based on the provided specifications.
     */
    _aggregateOffers(offers, limitOrderAmount, ordiMarketPrice) {
        // Implement the aggregation logic here
        // This should handle the various scenarios (A, B, C)

        // Example:
        // const bestOffers = this._findBestOffer(offers, limitOrderAmount, ordiMarketPrice);
        // return bestOffers;
    }

    /**
     * Finds the best offer based on the limit order amount and market price.
     */
    _findBestOffer(offers, limitOrderAmount, ordiMarketPrice) {
        // Logic to find the best offer
        // This will involve sorting, filtering, and possibly combining offers
        // to find the best match.
    }

}