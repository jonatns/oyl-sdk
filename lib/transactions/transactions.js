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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaUtxos = exports.convertUsdValue = exports.calculateBalance = exports.getBtcPrice = exports.getUnspentOutputs = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 *
 Returns from https://www.blockchain.com/explorer/api/blockchain_api.
 One way UTXOs can be gotten directly from the node is with RPC command - 'gettxout'
 However this accepts a single transaction as a parameter, making it impratical to use
 directly when getting UTXOs by address/public key. The best idea will be to index the
 all UTXOs from the blockchain in a db (just like with wallets and transactions on bcoin)
 and extend the bcoin RPC server. To return the nodes.
 Also consider - if this is a client wallet that can be run with a custom server, there will
 need to be a default alternative outside Oyl Api (e.g the blockchainApi)
 *
 */
const getUnspentOutputs = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, node_fetch_1.default)(`https://blockchain.info/unspent?active=${address}`, {
            headers: {
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch unspent output for address ${address}`);
        }
        const jsonResponse = yield response.json();
        return jsonResponse;
    }
    catch (error) {
        console.log(Error);
    }
});
exports.getUnspentOutputs = getUnspentOutputs;
const getBtcPrice = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, node_fetch_1.default)(`https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`, {
            headers: {
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch btc price from binance`);
        }
        const jsonResponse = yield response.json();
        return jsonResponse;
    }
    catch (error) {
        console.log(Error);
    }
});
exports.getBtcPrice = getBtcPrice;
const calculateBalance = function (utxos) {
    let balance = 0;
    for (let utxo = 0; utxo < utxos.length; utxo++) {
        balance += utxos[utxo].value;
    }
    return balance / 1e8; // Convert from satoshis to BTC
};
exports.calculateBalance = calculateBalance;
const convertUsdValue = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    const pricePayload = yield (0, exports.getBtcPrice)();
    const btcPrice = parseFloat(pricePayload.price);
    const amountInBTC = parseFloat(amount) * btcPrice;
    return amountInBTC.toFixed(2);
});
exports.convertUsdValue = convertUsdValue;
const getMetaUtxos = (utxos, inscriptions) => __awaiter(void 0, void 0, void 0, function* () {
    const formattedData = [];
    for (const utxo of utxos) {
        const formattedUtxo = {
            txId: utxo.tx_hash_big_endian,
            outputIndex: utxo.tx_output_n,
            satoshis: utxo.value,
            scriptPk: utxo.script,
            addressType: getAddressType(utxo.script),
            inscriptions: [],
        };
        for (const inscription of inscriptions) {
            if (inscription.id.includes(utxo.tx_hash_big_endian)) {
                formattedUtxo.inscriptions.push({
                    id: inscription.id,
                    num: inscription.num,
                    offset: inscription.detail.offset,
                });
            }
        }
        formattedData.push(formattedUtxo);
    }
    return formattedData;
});
exports.getMetaUtxos = getMetaUtxos;
function getAddressType(script) {
    // Add  logic to determine the address type based on the script
    // For example, you can check if it's a P2PKH or P2SH script
    // and return the corresponding AddressType enum value
    // Assuming you have an AddressType enum defined
    // const AddressType = {
    //   P2PKH: 'P2PKH',
    //   P2SH: 'P2SH'
    // };
    //return AddressType.P2PKH;
    return "P2TR";
}
//# sourceMappingURL=transactions.js.map