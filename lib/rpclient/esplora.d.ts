export declare class EsploraRpc {
    esploraUrl: string;
    constructor(url: string);
    _call(method: any, params?: any[]): Promise<any>;
}
