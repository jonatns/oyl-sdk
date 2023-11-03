import { SwapBrcBid, SignedBid } from '../shared/interface';
/**
 * Represents the client for interacting with the Oyl API.
 */
export declare class OylApiClient {
    private host;
    /**
     * Create an instance of the OylApiClient.
     * @param options - Configuration object containing the API host.
     */
    constructor(options?: {
        host: string;
    });
    /**
     * Create an instance of the OylApiClient from a plain object.
     * @param data - The data object.
     * @returns An instance of OylApiClient.
     */
    static fromObject(data: {
        host: string;
    }): OylApiClient;
    /**
     * Convert this OylApiClient instance to a plain object.
     * @returns The plain object representation.
     */
    toObject(): {
        host: string;
    };
    private _call;
    /**
     * Import an address to the Oyl API.
     * @param address - The address to be imported.
     */
    importAddress({ address }: {
        address: string;
    }): Promise<any>;
    /**
     * Push a transaction.
     * @param transactionHex - The hex of the transaction.
     */
    pushTx({ transactionHex }: {
        transactionHex: string;
    }): Promise<any>;
    /**
     * Get transactions by address.
     * @param address - The address to query.
     */
    getTxByAddress(address: string): Promise<any>;
    /**
     * Get transactions by hash.
     * @param address - The hash to query.
     */
    getTxByHash(hash: string): Promise<any>;
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
     * List wallets.
     */
    listWallet(): Promise<any>;
    /**
     * List transactions.
     */
    listTx(): Promise<any>;
    /**
     * Get raw mempool.
     */
    getRawMempool(): Promise<any>;
    /**
     * Get mempool information.
     */
    getMempoolInfo(): Promise<any>;
    /**
     * Get ticker offers.
     * @param _ticker - The ticker to query.
     */
    getTickerOffers({ _ticker }: {
        _ticker: string;
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
    /**
     * Get transaction fees.
     */
    getFees(): Promise<any>;
    /**
     * Subscribe for notifications.
     * @param webhookUrl - The URL to send notifications.
     * @param rbf - Replace-by-fee flag.
     */
    subscribe({ webhookUrl, rbf, }: {
        webhookUrl: string;
        rbf?: boolean;
    }): Promise<any>;
    /**
     * Import an address and subscribe for notifications.
     * @param address - The address to be imported.
     * @param webhookUrl - The URL to send notifications.
     * @param rbf - Replace-by-fee flag.
     */
    importSubscribe({ address, webhookUrl, rbf, }: {
        address: string;
        webhookUrl: string;
        rbf?: boolean;
    }): Promise<void>;
}
