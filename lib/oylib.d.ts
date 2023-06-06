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
    getTaprootAddress(publicKey: string): Promise<string>;
    importWallet(mnemonic: string, hdPath?: string, type?: string): Promise<any>;
    getSegwitAddress(publicKey: string): Promise<string>;
    createWallet(type?: any): Promise<any>;
    getMetaBalance(address: any): Promise<{
        confirm_amount: any;
        pending_amount: any;
        amount: any;
        usd_value: string;
    }>;
    getTxHistory(address: any): Promise<any>;
    getActiveAddresses(xpub: any, lookAhead?: number): Promise<any[]>;
    getTotalBalance(batch: any): Promise<number>;
    getInscriptions(address: any): Promise<any>;
    getUtxosArtifacts(address: any): Promise<any[]>;
    importWatchOnlyAddress(addresses: []): Promise<void>;
}
