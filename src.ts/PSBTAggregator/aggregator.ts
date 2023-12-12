import { OylApiClient } from "../apiclient"
import { MarketplaceOffer } from "../shared/interface";

export class Aggregator {
    public apiClient
    public offers

    constructor() {
        this.apiClient = new OylApiClient({ host: 'https://api.oyl.gg' })
    }

    /**
     * Fetches offers from all APIs and aggregates them.
     */
    async fetchAndAggregateOffers(ticker, limitOrderAmount, marketPrice) {
        const offers = await this._fetchAllOffers(ticker);
        return this.findBestAndClosestMatches(offers, limitOrderAmount, marketPrice);
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

        this.offers = allOffers;
        return allOffers;
    } catch (error) {
        throw Error ("An error occured while fetching offers")
    }
    }

    async findBestAndClosestMatches(offers, targetAmount, marketPrice) {
        const targetPrice = targetAmount * marketPrice;
        
        // Prepare the costs and weights for the algorithm
        const costs = offers.map(offer => offer.totalPrice); // Total price of each offer
        const amounts = offers.map(offer => offer.amount);
    
        const solutions = await this.findSolutionsWithinRange(costs, amounts, 0, Math.max(...amounts));
        if (solutions.length === 0) {
            return null; // No solutions available
        }
    
        // Find the solution with the best average price
        let bestPriceSolution = solutions[0];
        let bestAveragePrice = bestPriceSolution.minCost / this.sumAmounts(bestPriceSolution.selectedIndices, offers);
        
        for (const solution of solutions) {
            let averagePrice = solution.minCost / this.sumAmounts(solution.selectedIndices, offers);
            if (averagePrice < bestAveragePrice) {
                bestAveragePrice = averagePrice;
                bestPriceSolution = solution;
            }
        }
    
        // Find the closest match to the target price and amount
        let closestMatchSolution = solutions[0];
        let minDifference = Math.abs(targetPrice - this.sumTotalPrice(closestMatchSolution.selectedIndices, offers));
        
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
                offers: bestPriceSolution.selectedIndices.map(index => offers[index])
            },
            closestMatch: {
                averagePrice: closestMatchSolution.minCost / this.sumAmounts(closestMatchSolution.selectedIndices, offers),
                totalPrice: closestMatchSolution.minCost,
                offers: closestMatchSolution.selectedIndices.map(index => offers[index])
            }
        };
    }


    sumAmounts(indices, offers) {
        return indices.reduce((sum, index) => sum + offers[index].amount, 0);
    }
    
    sumTotalPrice(indices, offers) {
        return indices.reduce((sum, index) => sum + offers[index].totalPrice, 0);
    }

    async findSolutionsWithinRange(costs, weights, minWeightLimit, maxWeightLimit) {
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
              if (currentWeight >= weights[i] && dp[currentWeight] === dp[currentWeight - weights[i]] + costs[i]) {
                selectedIndices.push(i);
                currentWeight -= weights[i];
              }
            }
    
           
            if (solutions.length === 0 || solutions[solutions.length - 1].weight !== w) {
              solutions.push({
                weight: w,
                minCost: dp[w],
                selectedIndices: selectedIndices.reverse()
              });
            }
          }
        }
    
        return solutions;
      }

}