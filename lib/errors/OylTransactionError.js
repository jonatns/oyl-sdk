"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OylTransactionError = void 0;
class OylTransactionError extends Error {
    constructor(message, successTxIds) {
        super(message);
        this.name = 'OylTransactionError';
        this.successTxIds = successTxIds || [];
    }
}
exports.OylTransactionError = OylTransactionError;
//# sourceMappingURL=OylTransactionError.js.map