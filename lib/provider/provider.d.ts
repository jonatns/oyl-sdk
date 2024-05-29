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
    constructor({ url, projectId, network, version, }: {
        url: string;
        projectId: string;
        network: bitcoin.networks.Network;
        version?: string;
    });
}
