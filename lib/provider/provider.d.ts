import { SandshrewBitcoinClient } from '../rpclient/sandshrew';
import { EsploraRpc } from '../rpclient/esplora';
import { OrdRpc } from '../rpclient/ord';
import * as bitcoin from 'bitcoinjs-lib';
export type ProviderConstructorArgs = {
    url: string;
    projectId: string;
    network: bitcoin.networks.Network;
    networkType: 'signet' | 'mainnet' | 'testnet' | 'regtest';
    version?: string;
    apiProvider?: any;
};
export declare class Provider {
    sandshrew: SandshrewBitcoinClient;
    esplora: EsploraRpc;
    ord: OrdRpc;
    api: any;
    network: bitcoin.networks.Network;
    networkType: string;
    url: string;
    constructor({ url, projectId, network, networkType, version, apiProvider, }: ProviderConstructorArgs);
    pushPsbt({ psbtHex, psbtBase64, }: {
        psbtHex?: string;
        psbtBase64?: string;
    }): Promise<{
        txId: string;
        rawTx: string;
        size: any;
        weight: any;
        fee: number;
        satsPerVByte: string;
    }>;
}
