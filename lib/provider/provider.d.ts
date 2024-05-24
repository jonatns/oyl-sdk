import { SandshrewBitcoinClient } from '../rpclient/sandshrew';
import { EsploraRpc } from '../rpclient/esplora';
import { OrdRpc } from '../rpclient/ord';
export declare class Provider {
    sandshrew: SandshrewBitcoinClient;
    esplora: EsploraRpc;
    ord: OrdRpc;
    constructor(url: any);
}
