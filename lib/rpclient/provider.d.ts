import { SandshrewBitcoinClient } from './sandshrew';
import { EsploraRpc } from './esplora';
import { OrdRpc } from './ord';
export declare class Provider {
    sandshrew: SandshrewBitcoinClient;
    esplora: EsploraRpc;
    ord: OrdRpc;
    constructor(url: any);
}
