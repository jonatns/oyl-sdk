"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBalance = exports.getUnspentOutputs = void 0;
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
const getUnspentOutputs = async (address) => {
    try {
        const response = await (0, node_fetch_1.default)(`https://blockchain.info/unspent?active=${address}`, {
            headers: {
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch inscriptions for address ${address}`);
        }
        const jsonResponse = await response.json();
        return jsonResponse;
    }
    catch (error) {
        console.log(Error);
    }
};
exports.getUnspentOutputs = getUnspentOutputs;
const calculateBalance = function (utxos) {
    let balance = 0;
    for (let utxo = 0; utxo < utxos.length; utxo++) {
        balance += utxos[utxo].value;
    }
    return balance / 1e8; // Convert from satoshis to BTC
};
exports.calculateBalance = calculateBalance;
//# sourceMappingURL=transactions.js.map