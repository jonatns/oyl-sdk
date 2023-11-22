export declare class EsploraRpc {
    esploraUrl: string;
    constructor(url: string);
    _call(method: any, params?: any[]): Promise<any>;
    getTxInfo(txid: string): Promise<any>;
    getTxStatus(txid: string): Promise<any>;
    getTxHex(txid: string): Promise<any>;
    getTxRaw(txid: string): Promise<any>;
    getTxOutspends(txid: string): Promise<any>;
    getAddressTx(address: string): Promise<any>;
    getAddressUtxo(address: string): Promise<any>;
    getFeeEstimates(): Promise<any>;
}
