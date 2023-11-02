import BcoinRpc from './rpclient';
import { SwapBrc, ProviderOptions, Providers, RecoverAccountOptions } from './shared/interface';
import { OylApiClient } from './apiclient';
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
    recoverWallet(options: RecoverAccountOptions): Promise<any>;
    addAccountToWallet(options: RecoverAccountOptions): Promise<any>;
    initializeWallet(): Promise<any>;
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
    getTxValueFromPrevOut(inputs: any[], address: string): Promise<number>;
    getTxHistory({ address }: {
        address: any;
    }): Promise<any>;
    getFees(): Promise<{
        High: number;
        Medium: number;
        Low: number;
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
    /**
    *
    * Example implementation to send BTC DO NOT USE!!!
  */
    sendBtc({ mnemonic, to, amount, fee }: {
        mnemonic: any;
        to: any;
        amount: any;
        fee: any;
    }): Promise<any>;
    /**
    *
    * Example implementation to send Ordinal DO NOT USE!!!
  
  async sendOrd({ mnemonic, to,  inscriptionId, inscriptionOffset, inscriptionOutputValue, fee }) {
    const payload = await this.fromPhrase({
      mnemonic: mnemonic.trim(),
      hdPath: "m/49'/0'/0'",
      type: 'segwit',
    })
    const keyring = payload.keyring.keyring;
    const pubKey = keyring.wallets[0].publicKey.toString('hex');
    const signer = keyring.signTransaction.bind(keyring);
    const from = payload.keyring.address;
    const changeAddress = from;
    return await this.createOrdPsbtTx({
      publicKey: pubKey,
      fromAddress: from,
      toAddress: to,
      changeAddress: changeAddress,
      txFee: fee,
      signer: signer,
      inscriptionId,
      metaOffset: inscriptionOffset,
      metaOutputValue: inscriptionOutputValue
    })
  }
  */
    createOrdPsbtTx({ publicKey, fromAddress, toAddress, changeAddress, txFee, signer, inscriptionId, }: {
        publicKey: string;
        fromAddress: string;
        toAddress: string;
        changeAddress: string;
        txFee: number;
        signer: any;
        inscriptionId: string;
    }): Promise<any>;
    createPsbtTx({ publicKey, from, to, changeAddress, amount, fee, signer, }: {
        publicKey: string;
        from: string;
        to: string;
        changeAddress: string;
        amount: string;
        fee: number;
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
    listBrc20s({ address }: {
        address: string;
    }): Promise<any>;
    listCollectibles({ address }: {
        address: string;
    }): Promise<any>;
    getCollectibleById(inscriptionId: string): Promise<any>;
}
