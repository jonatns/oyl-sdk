"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aggregator = void 0;
class Aggregator {
    constructor(apiClients) {
        this.apiClients = apiClients;
    }
    /**
     * Fetches offers from all APIs and aggregates them.
     */
    fetchAndAggregateOffers(limitOrderAmount, ordiMarketPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Fetch offers from all APIs
            //   const offers = await this._fetchAllOffers();
            // 2. Aggregate offers based on the specifications
            //   return this._aggregateOffers(offers, limitOrderAmount, ordiMarketPrice);
        });
    }
    /**
     * Fetches offers from all external marketplaces.
     */
    _fetchAllOffers() {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement logic to fetch offers from all APIs
        });
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
exports.Aggregator = Aggregator;
//# sourceMappingURL=aggregator.js.map