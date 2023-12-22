"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdRpc = void 0;
class OrdRpc {
    constructor(url) {
        this.ordUrl = url;
    }
    _call(method, params = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestData = {
                jsonrpc: '2.0',
                method: method,
                params: params,
                id: 2,
            };
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            };
            try {
                const response = yield fetch(this.ordUrl, requestOptions);
                const responseData = yield response.json();
                if (responseData.error) {
                    console.error('Ord JSON-RPC Error:', responseData.error);
                    return null;
                }
                return responseData.result;
            }
            catch (error) {
                console.error('Request Error:', error);
                throw error;
            }
        });
    }
    getInscriptionById(inscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_inscription', [inscriptionId]);
        });
    }
    getInscriptionContent(inscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_content', [inscriptionId]);
        });
    }
    getInscriptionByNumber(number) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_inscription', [number]);
        });
    }
    getInscriptions(numberToReturn, startingWith) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_inscriptions', [startingWith, numberToReturn]);
        });
    }
    getInscriptionsByBlockHash(blockHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_block', [blockHash]);
        });
    }
    getInscriptionsByBlockHeight(blockHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_block', [blockHash]);
        });
    }
    getInscriptionBySat(satNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_r:sat', [satNumber]);
        });
    }
    getInscriptionBySatWithIndex(satNumber, index) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_r:sat::at', [satNumber, index]);
        });
    }
    getInscriptionChildren(inscriptionId, page) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_r:children', [inscriptionId, page]);
        });
    }
    getInscriptionMetaData(inscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_r:metadata', [inscriptionId]);
        });
    }
    getTxOutput(txIdVout) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_output', [txIdVout]);
        });
    }
    getSatByNumber(number) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_sat', [number]);
        });
    }
    getSatByDecimal(decimal) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_sat', [decimal]);
        });
    }
    getSatByDegree(degree) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_sat', [degree]);
        });
    }
    getSatByBase26(base26) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_sat', [base26]);
        });
    }
    getSatByPercentage(percentage) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._call('ord_sat', [percentage]);
        });
    }
}
exports.OrdRpc = OrdRpc;
//# sourceMappingURL=ord.js.map