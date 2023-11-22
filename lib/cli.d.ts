import "dotenv/config";
export declare function loadRpc(options: any): Promise<void>;
export declare function callAPI(command: any, data: any, options?: {}): Promise<any>;
export declare function swapFlow(): Promise<void>;
export declare function runCLI(): Promise<any>;
