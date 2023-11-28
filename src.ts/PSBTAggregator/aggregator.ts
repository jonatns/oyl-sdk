import { OylApiClient } from "../apiclient"

export class Aggregator {
    public apiClient

    constructor(apiClients) {
        this.apiClient = new OylApiClient({ host: 'https://api.oyl.gg' })
    }

    /**
     * Fetches offers from all APIs and aggregates them.
     */
    async fetchAndAggregateOffers(limitOrderAmount, ordiMarketPrice) {
        // 1. Fetch offers from all APIs
        //   const offers = await this._fetchAllOffers();

        // 2. Aggregate offers based on the specifications
        //   return this._aggregateOffers(offers, limitOrderAmount, ordiMarketPrice);
    }

    /**
     * Fetches offers from all external marketplaces.
     */
    async _fetchAllOffers() {
        // Implement logic to fetch offers from all APIs
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