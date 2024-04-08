"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllInscriptionsByAddressRegtest = void 0;
const oylib_1 = require("../oylib");
const constants_1 = require("../shared/constants");
const getAllInscriptionsByAddressRegtest = async (address) => {
    const oyl = new oylib_1.Oyl(constants_1.defaultNetworkOptions.regtest);
    const utxosResponse = await oyl.esploraRpc.getAddressUtxo(address);
    const data = [];
    const inscriptionUtxos = utxosResponse.filter((utxo) => utxo.value == 546);
    for (const utxo of inscriptionUtxos) {
        if (utxo.txid) {
            const transactionDetails = await oyl.ordRpc.getTxOutput(utxo.txid + ':' + utxo.vout);
            const { inscription_id, inscription_number, satpoint, content_type, address } = await oyl.ordRpc.getInscriptionById(transactionDetails.inscriptions[0]);
            if (inscription_id) {
                data.push({
                    inscription_id,
                    inscription_number,
                    satpoint,
                    mime_type: content_type,
                    owner_wallet_addr: address
                });
            }
        }
    }
    return {
        statusCode: 200,
        data
    };
};
exports.getAllInscriptionsByAddressRegtest = getAllInscriptionsByAddressRegtest;
//# sourceMappingURL=regtestApi.js.map