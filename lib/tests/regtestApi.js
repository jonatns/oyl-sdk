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
exports.getAllInscriptionsByAddressRegtest = void 0;
const oylib_1 = require("../oylib");
const constants_1 = require("../shared/constants");
const getAllInscriptionsByAddressRegtest = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const oyl = new oylib_1.Oyl(constants_1.defaultNetworkOptions.regtest);
    const utxosResponse = yield oyl.esploraRpc.getAddressUtxo(address);
    const data = [];
    const inscriptionUtxos = utxosResponse.filter((utxo) => utxo.value == 546);
    for (const utxo of inscriptionUtxos) {
        if (utxo.txid) {
            const transactionDetails = yield oyl.ordRpc.getTxOutput(utxo.txid + ':' + utxo.vout);
            const { inscription_id, inscription_number, satpoint, content_type, address, } = yield oyl.ordRpc.getInscriptionById(transactionDetails.inscriptions[0]);
            if (inscription_id) {
                data.push({
                    inscription_id,
                    inscription_number,
                    satpoint,
                    mime_type: content_type,
                    owner_wallet_addr: address,
                });
            }
        }
    }
    return {
        statusCode: 200,
        data,
    };
});
exports.getAllInscriptionsByAddressRegtest = getAllInscriptionsByAddressRegtest;
//# sourceMappingURL=regtestApi.js.map