import { SandshrewBitcoinClient } from "./sandshrew";
import { EsploraRpc } from "./esplora";
export declare class Provider {
    sandshrew: SandshrewBitcoinClient;
    esplora: EsploraRpc;
    constructor(url: any);
}
