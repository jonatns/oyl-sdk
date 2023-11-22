export declare function loadRpc(options: any): Promise<{}>;
export declare function callAPI(command: any, data: any, options?: {}): Promise<any>;
export declare function swapFlow(options: any): Promise<string>;
export declare const MEMPOOL_SPACE_API_V1_URL = "https://mempool.space/api/v1";
export declare const createInscriptionScript: (pubKey: any, content: any) => any[];
export declare const RPC_ADDR = "https://node.oyl.gg/v1/6e3bc3c289591bb447c116fda149b094";
export declare const callBTCRPCEndpoint: (method: string, params: string | string[]) => Promise<any>;
export declare const inscribe: ({ ticker, amount, inputAddress, outputAddress, commitTxId, isDry, }: {
    ticker: string;
    amount: number;
    inputAddress: string;
    outputAddress: string;
    commitTxId?: string;
    isDry?: boolean;
}) => Promise<any>;
export declare function runCLI(): Promise<any>;
