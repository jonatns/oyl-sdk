import { SandshrewBitcoinClient } from '../rpclient/sandshrew';
import { EsploraRpc } from '../rpclient/esplora';
import { OrdRpc } from '../rpclient/ord';
import { OylApiClient } from '../apiclient';
import * as bitcoin from 'bitcoinjs-lib';
export declare class Provider {
    sandshrew: SandshrewBitcoinClient;
    esplora: EsploraRpc;
    ord: OrdRpc;
    api: OylApiClient;
    network: bitcoin.networks.Network;
    constructor({ url, projectId, network, networkType, version, }: {
        url: string;
        projectId: string;
        network: bitcoin.networks.Network;
        networkType: 'signet' | 'mainnet' | 'testnet';
        version?: string;
    });
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
    getCollectibleById(inscriptionId: string): Promise<{
        address: string;
        children: any[];
        content_length: number;
        content_type: string;
        genesis_fee: number;
        genesis_height: number;
        inscription_id: string;
        inscription_number: number;
        next: string;
        output_value: number;
        parent: any;
        previous: string;
        rune: any;
        sat: number;
        satpoint: string;
        timestamp: number;
    }>;
}
