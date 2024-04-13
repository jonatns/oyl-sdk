export declare class OylMultiTransactionError extends Error {
    successTxIds: string[];
    constructor(message: string, successTxIds?: string[]);
}
