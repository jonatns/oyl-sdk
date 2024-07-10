"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Opi = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
class Opi {
    opiUrl;
    constructor(opiUrl) {
        this.opiUrl = opiUrl;
    }
    async _call(url) {
        const requestOptions = {
            method: 'GET',
            cache: 'no-cache',
        };
        try {
            const response = await (0, node_fetch_1.default)(url, requestOptions);
            const responseData = await response.json();
            if (responseData.error) {
                console.error('Opi Error:', responseData.error);
                throw new Error(responseData.error);
            }
            return responseData.result;
        }
        catch (error) {
            console.error('Request Error:', error);
            throw error;
        }
    }
    async getBrc20Balance({ address, ticker, }) {
        return await this._call(`${this.opiUrl}/brc20/get_current_balance_of_wallet?address=${address}&ticker=${ticker}`);
    }
    async getUnspentBRC20ByAddress({ address }) {
        return (await this._call(`${this.opiUrl}/brc20/get_valid_tx_notes_of_wallet?address=${address}`)).unused_txes;
    }
    async getAllUnspentBRC20ByTicker({ ticker }) {
        return (await this._call(`${this.opiUrl}/brc20/get_valid_tx_notes_of_ticker?ticker=${ticker}`)).unused_txes;
    }
    async getBRC20HoldersByTicker({ ticker }) {
        return (await this._call(`${this.opiUrl}/brc20/holders?ticker=${ticker}`))
            .unused_txes;
    }
    async getBRC20EventsByInscriptionId({ inscId }) {
        return await this._call(`${this.opiUrl}/brc20/event?inscription_id=${inscId}`);
    }
    async getUnspentRuneByAddress({ address }) {
        return await this._call(`${this.opiUrl}/runes/get_unspent_rune_outpoints_of_wallet?address=${address}`);
    }
}
exports.Opi = Opi;
//# sourceMappingURL=opi.js.map