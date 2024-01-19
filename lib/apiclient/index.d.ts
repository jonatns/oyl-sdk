import { SwapBrcBid, SignedBid } from '../shared/interface';
/**
 * Represents the client for interacting with the Oyl API.
 */
export declare class OylApiClient {
    private host;
    private testnet;
    /**
     * Create an instance of the OylApiClient.
     * @param options - Configuration object containing the API host.
     */
    constructor(options?: {
        host: string;
        testnet?: boolean;
    });
    /**
     * Create an instance of the OylApiClient from a plain object.
     * @param data - The data object.
     * @returns An instance of OylApiClient.
     */
    static fromObject(data: {
        host: string;
        testnet?: boolean;
    }): OylApiClient;
    /**
     * Convert this OylApiClient instance to a plain object.
     * @returns The plain object representation.
     */
    toObject(): {
        host: string;
        testnet: boolean;
    };
    private _call;
    /**
     * Get brc20 info by ticker.
     * @param ticker - The hash to query.
     */
    getBrc20TokenInfo(ticker: string): Promise<any>;
    /**
     * Get Brc20 balances by address.
     * @param address - The address to query.
     */
    getBrc20sByAddress(address: string): Promise<any>;
    getAllInscriptionsByAddress(address: string): Promise<any>;
    /**
     * Get collectible by ID.
     * @param id - The ID of the collectible.
     */
    getCollectiblesById(id: string): Promise<any>;
    /**
     * Get collectibles by address.
     * @param address - The address to query.
     */
    getCollectiblesByAddress(address: string): Promise<any>;
    /**
     * Get Unisat ticker offers.
     * @param _ticker - The ticker to query.
     */
    getUnisatTickerOffers({ ticker }: {
        ticker: string;
    }): Promise<any>;
    /**
     * Get Aggregated brc20 ticker offers for a limit order.
     * @param ticker - The ticker to query.
     * @param limitOrderAmount - The limit order amount.
     * @param marketPrice - The limit order market price.
     * @param testnet - mainnet/testnet network toggle.
     */
    getAggregatedOffers({ ticker, limitOrderAmount, marketPrice, testnet, }: {
        ticker: string;
        limitOrderAmount: number;
        marketPrice: number;
        testnet?: boolean;
    }): Promise<any>;
    /**
     * Get Okx ticker offers.
     * @param _ticker - The ticker to query.
     */
    getOkxTickerOffers({ ticker }: {
        ticker: string;
    }): Promise<any>;
    /**
     * Get Okx offer psbt.
     * @param offerId - The offer Id to query.
     */
    getOkxOfferPsbt({ offerId }: {
        offerId: number;
    }): Promise<any>;
    /**
     * Get Omnisat offer psbt.
     * @param offerId - The offer Id to query.
     */
    getOmnisatOfferPsbt({ offerId, ticker, testnet, }: {
        offerId: string;
        ticker: string;
        testnet?: boolean;
    }): Promise<any>;
    /**
     * Initialize a swap bid.
     * @param params - Parameters for the bid.
     */
    initSwapBid(params: SwapBrcBid): Promise<any>;
    /**
     * Submit a signed bid.
     * @param params - Parameters for the signed bid.
     */
    submitSignedBid(params: SignedBid): Promise<any>;
}
