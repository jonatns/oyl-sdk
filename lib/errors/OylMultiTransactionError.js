"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OylMultiTransactionError = void 0;
class OylMultiTransactionError extends Error {
    constructor(message, successTxIds) {
        super(message);
        this.name = 'OylTransactionError';
        this.successTxIds = successTxIds || [];
    }
}
exports.OylMultiTransactionError = OylMultiTransactionError;
//# sourceMappingURL=OylMultiTransactionError.js.map