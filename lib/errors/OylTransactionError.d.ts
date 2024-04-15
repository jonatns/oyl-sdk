export declare class OylTransactionError extends Error {
    successTxIds: string[];
    constructor(message: string, successTxIds?: string[]);
}
