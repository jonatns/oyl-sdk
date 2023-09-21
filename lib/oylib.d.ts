import NodeClient from './rpclient';
import { OylApiClient } from "./apiclient";
export declare class Wallet {
    private node;
    private network;
    private port;
    private apiKey;
    private host;
    private nodeClient;
    client: NodeClient;
    oylApiClient: OylApiClient;
    derivPath: String;
    /***
     * TO-DO
     * Replace NodeCLient with ApiClient so all requests to the node gets routed
     * through Oyl's api server
     */
    constructor(options?: any);
    static fromObject(data: any): Wallet;
    toObject(): {
        network: String;
        port: Number;
        host: String;
        apiKey: String;
    };
    getAddressSummary({ address }: {
        address: any;
    }): Promise<any[]>;
    getTaprootAddress({ publicKey }: {
        publicKey: any;
    }): Promise<any>;
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
    private calculateHighPriorityFee;
    getFees(): Promise<{
        high: number;
        medium: number;
        low: number;
    }>;
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
    createPsbtTx({ publicKey, from, to, changeAddress, amount, fee, signer }: {
        publicKey: any;
        from: any;
        to: any;
        changeAddress: any;
        amount: any;
        fee: any;
        signer: any;
    }): Promise<any>;
    getSegwitAddressInfo({ address }: {
        address: any;
    }): Promise<{
        isValid: boolean;
        summary: any;
    } | {
        isValid: true;
        summary: any[];
    }>;
    getTaprootAddressInfo({ address }: {
        address: any;
    }): Promise<{
        isValid: boolean;
        summary: any;
    } | {
        isValid: true;
        summary: any[];
    }>;
}
