import BcoinRpc from './rpclient';
import { HDKeyringOption } from './wallet/hdKeyring';
import { SwapBrc, ProviderOptions, Providers } from './shared/interface';
import { OylApiClient } from "./apiclient";
export declare class Wallet {
    private mnemonic;
    private wallet;
    provider: Providers;
    rpcClient: BcoinRpc;
    apiClient: OylApiClient;
    derivPath: String;
    constructor();
    static connect(provider: BcoinRpc): Wallet;
    fromProvider(options?: ProviderOptions): {};
    getAddressSummary({ address }: {
        address: any;
    }): Promise<any[]>;
    getTaprootAddress({ publicKey }: {
        publicKey: any;
    }): Promise<any>;
    fromPhrase({ mnemonic, type, hdPath }: {
        mnemonic: any;
        type?: string;
        hdPath?: string;
    }): Promise<any>;
    recoverWallet(options: HDKeyringOption): Promise<any>;
    getSegwitAddress({ publicKey }: {
        publicKey: any;
    }): Promise<string>;
    createWallet({ type }: {
        type?: String;
    }): any;
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
    sendBtc({ mnemonic, to, amount, fee }: {
        mnemonic: any;
        to: any;
        amount: any;
        fee: any;
    }): Promise<any>;
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
    getBrcOffers({ ticker }: {
        ticker: any;
    }): Promise<any>;
    swapBrc(bid: SwapBrc): Promise<any>;
    swapFlow(options: any): Promise<string>;
}
