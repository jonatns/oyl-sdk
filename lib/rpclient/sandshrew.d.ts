import { IRpcMethods } from '../shared/interface';
export declare class SandshrewBitcoinClient {
    apiUrl: string;
    bitcoindRpc: IRpcMethods;
    private queueLength;
    static readonly DEBOUNCE_MS = 100;
    constructor(apiUrl: any);
    _call(method: string, params?: any[]): Promise<any>;
    getBlockTimeByHeight(blockHeight: number): Promise<number>;
    multiCall(parameters: (string | string[] | object | object[])[][]): Promise<any>;
    _initializeRpcMethods(): void;
    _createRpcMethod(methodName: any, argType: any): void;
    _convertArg(arg: any, argType: any): any;
}
