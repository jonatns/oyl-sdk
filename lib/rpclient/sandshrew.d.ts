export declare class SandshrewBitcoinClient {
    apiUrl: string;
    constructor(apiUrl: any);
    _call(method: any, params?: any[]): Promise<any>;
    _initializeRpcMethods(): void;
    _createRpcMethod(methodName: any, argType: any): void;
    _convertArg(arg: any, argType: any): any;
}
