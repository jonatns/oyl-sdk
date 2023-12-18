import { SandshrewBitcoinClient } from "./sandshrew";
import { EsploraRpc } from "./esplora";

export class Provider {
    public sandshrew: SandshrewBitcoinClient
    public esplora: EsploraRpc

    constructor(url){
        this.sandshrew = new SandshrewBitcoinClient(url)
        this.esplora = new EsploraRpc(url)
    }
}