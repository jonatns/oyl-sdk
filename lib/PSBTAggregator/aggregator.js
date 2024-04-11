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
const apiclient_1 = require("../apiclient");
class Aggregator {
    constructor() {
        this.apiClient = new apiclient_1.OylApiClient({
            host: 'https://api.oyl.gg',
            apiKey: '',
        });
    }
    /**
     * Fetches offers from all APIs and aggregates them.
     */
    fetchAndAggregateOffers(ticker, limitOrderAmount, marketPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const offers = yield this._fetchAllOffers(ticker);
            console.log({ offers });
            return this.findBestAndClosestMatches(offers, limitOrderAmount, marketPrice);
        });
    }
    /**
     * Fetches offers from all external marketplaces.
     */
    _fetchAllOffers(ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allOffers = [];
                const okxOffers = yield this.apiClient.getOkxTickerOffers({ ticker });
                for (const offer of okxOffers) {
                    allOffers.push({
                        ticker: offer.ticker,
                        offerId: offer.nftId,
                        amount: offer.amount,
                        address: offer.ownerAddress,
                        marketplace: 'okx',
                        unitPrice: parseFloat(offer.unitPrice.satPrice),
                        totalPrice: parseFloat(offer.totalPrice.satPrice),
                    });
                }
                const unisatOffers = yield this.apiClient.getUnisatTickerOffers({
                    ticker,
                });
                for (const offer of unisatOffers) {
                    allOffers.push({
                        ticker: offer.tick,
                        offerId: offer.auctionId,
                        amount: offer.amount.toString(),
                        address: offer.address,
                        marketplace: 'unisat',
                        unitPrice: offer.unitPrice,
                        totalPrice: offer.price,
                    });
                }
                const omnisatOffers = yield this.apiClient.getOmnisatTickerOffers({
                    ticker,
                });
                for (const offer of omnisatOffers) {
                    allOffers.push({
                        ticker: offer.tick,
                        offerId: offer._id,
                        amount: offer.amount.toString(),
                        address: offer.ownerAddress,
                        marketplace: 'omnisat',
                        unitPrice: offer.amount / offer.price,
                        totalPrice: offer.price,
                    });
                }
                this.offers = allOffers;
                return allOffers;
            }
            catch (error) {
                console.error(error);
                throw Error('An error occured while fetching offers');
            }
        });
    }
    findBestAndClosestMatches(offers, targetAmount, marketPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetPrice = targetAmount * marketPrice;
            // Prepare the costs and weights for the algorithm
            const costs = offers.map((offer) => offer.totalPrice); // Total price of each offer
            const amounts = offers.map((offer) => offer.amount);
            const solutions = yield this.findSolutionsWithinRange(costs, amounts, 0, Math.max(...amounts));
            if (solutions.length === 0) {
                return null; // No solutions available
            }
            // Find the solution with the best average price
            let bestPriceSolution = solutions[0];
            let bestAveragePrice = bestPriceSolution.minCost /
                this.sumAmounts(bestPriceSolution.selectedIndices, offers);
            for (const solution of solutions) {
                let averagePrice = solution.minCost / this.sumAmounts(solution.selectedIndices, offers);
                if (averagePrice < bestAveragePrice) {
                    bestAveragePrice = averagePrice;
                    bestPriceSolution = solution;
                }
            }
            // Find the closest match to the target price and amount
            let closestMatchSolution = solutions[0];
            let minDifference = Math.abs(targetPrice -
                this.sumTotalPrice(closestMatchSolution.selectedIndices, offers));
            for (const solution of solutions) {
                let totalPrice = this.sumTotalPrice(solution.selectedIndices, offers);
                let difference = Math.abs(totalPrice - targetPrice);
                if (difference < minDifference) {
                    minDifference = difference;
                    closestMatchSolution = solution;
                }
            }
            return {
                bestPrice: {
                    averagePrice: bestAveragePrice,
                    totalPrice: bestPriceSolution.minCost,
                    offers: bestPriceSolution.selectedIndices.map((index) => offers[index]),
                },
                closestMatch: {
                    averagePrice: closestMatchSolution.minCost /
                        this.sumAmounts(closestMatchSolution.selectedIndices, offers),
                    totalPrice: closestMatchSolution.minCost,
                    offers: closestMatchSolution.selectedIndices.map((index) => offers[index]),
                },
            };
        });
    }
    sumAmounts(indices, offers) {
        return indices.reduce((sum, index) => sum + offers[index].amount, 0);
    }
    sumTotalPrice(indices, offers) {
        return indices.reduce((sum, index) => sum + offers[index].totalPrice, 0);
    }
    findSolutionsWithinRange(costs, weights, minWeightLimit, maxWeightLimit) {
        return __awaiter(this, void 0, void 0, function* () {
            const n = weights.length;
            const dp = Array(maxWeightLimit + 1).fill(Number.MAX_SAFE_INTEGER);
            dp[0] = 0;
            for (let i = 0; i < n; i++) {
                for (let w = maxWeightLimit; w >= weights[i]; w--) {
                    if (dp[w - weights[i]] !== Number.MAX_SAFE_INTEGER) {
                        dp[w] = Math.min(dp[w], dp[w - weights[i]] + costs[i]);
                    }
                }
            }
            const solutions = [];
            for (let w = maxWeightLimit; w >= minWeightLimit; w--) {
                if (dp[w] !== Number.MAX_SAFE_INTEGER) {
                    const selectedIndices = [];
                    let currentWeight = w;
                    for (let i = n - 1; i >= 0 && currentWeight > 0; i--) {
                        if (currentWeight >= weights[i] &&
                            dp[currentWeight] === dp[currentWeight - weights[i]] + costs[i]) {
                            selectedIndices.push(i);
                            currentWeight -= weights[i];
                        }
                    }
                    if (solutions.length === 0 ||
                        solutions[solutions.length - 1].weight !== w) {
                        solutions.push({
                            weight: w,
                            minCost: dp[w],
                            selectedIndices: selectedIndices.reverse(),
                        });
                    }
                }
            }
            return solutions;
        });
    }
}
exports.Aggregator = Aggregator;
//# sourceMappingURL=aggregator.js.map