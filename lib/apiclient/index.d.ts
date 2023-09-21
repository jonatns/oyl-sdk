export declare class OylApiClient {
    private host;
    constructor(options?: any);
    static fromObject(data: any): OylApiClient;
    toObject(): {
        host: String;
    };
    _call(path: any, method: any, data?: any): Promise<any>;
    catch(err: any): any;
    importAddress({ address }: {
        address: String;
    }): Promise<any>;
    listWallet(): Promise<any>;
    listTx(): Promise<any>;
    getRawMempool(): Promise<any>;
    getMempoolInfo(): Promise<any>;
    getTickerOffers({ _ticker }: {
        _ticker: String;
    }): Promise<any>;
    initSwapBid({ address, auctionId, bidPrice, pubKey }: {
        address: String;
        auctionId: String;
        bidPrice: Number;
        pubKey: String;
    }): Promise<any>;
    submitBid({ psbtBid, auctionId, bidId }: {
        psbtBid: String;
        auctionId: String;
        bidId: String;
    }): Promise<any>;
    getFees(): Promise<any>;
    subscribe({ webhookUrl, rbf }: {
        webhookUrl: String;
        rbf?: Boolean;
    }): Promise<any>;
    importSubscribe({ address, webhookUrl, rbf }: {
        address: String;
        webhookUrl: String;
        rbf?: Boolean;
    }): Promise<void>;
}
