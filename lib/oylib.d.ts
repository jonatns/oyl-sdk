export declare class WalletUtils {
    private node;
    private network;
    private port;
    private apiKey;
    private host;
    private nodeClient;
    client: any;
    derivPath: String;
    constructor(options?: any);
    static fromObject(data: any): WalletUtils;
    toObject(): {
        network: String;
        port: Number;
        host: String;
        apiKey: String;
    };
    getAddressSummary(address: any): Promise<any[]>;
    discoverBalance(xpub: any, gapLimit: any, enableImport?: boolean): Promise<void>;
    getActiveAddresses(xpub: any, lookAhead?: number): Promise<any[]>;
    getTotalBalance(batch: any): Promise<number>;
    importWatchOnlyAddress(addresses: []): Promise<void>;
}
