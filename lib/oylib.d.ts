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
    getAddressSummary({ address }: {
        address: any;
    }): Promise<any[]>;
    discoverBalance({ xpub, gapLimit, enableImport }: {
        xpub: any;
        gapLimit: any;
        enableImport?: boolean;
    }): Promise<void>;
    getTaprootAddress({ publicKey }: {
        publicKey: any;
    }): Promise<string>;
    importWallet({ mnemonic, hdPath, type }: {
        mnemonic: any;
        hdPath?: string;
        type?: string;
    }): Promise<any>;
    getSegwitAddress({ publicKey }: {
        publicKey: any;
    }): Promise<string>;
    createWallet({ type }: {
        type: any;
    }): Promise<any>;
    getMetaBalance({ address }: {
        address: any;
    }): Promise<{
        confirm_amount: any;
        pending_amount: any;
        amount: any;
        usd_value: string;
    }>;
    getTxHistory({ address }: {
        address: any;
    }): Promise<any>;
    getActiveAddresses({ xpub, lookAhead }: {
        xpub: any;
        lookAhead?: number;
    }): Promise<any[]>;
    getTotalBalance({ batch }: {
        batch: any;
    }): Promise<number>;
    getInscriptions({ address }: {
        address: any;
    }): Promise<any>;
    getUtxosArtifacts({ address }: {
        address: any;
    }): Promise<any[]>;
    importWatchOnlyAddress({ addresses }: {
        addresses?: any[];
    }): Promise<void>;
}
