import fetch from 'node-fetch'
import { IBlockchainInfoUTXO } from '../shared/interface';

export class EsploraRpc {
    public esploraUrl: string;

    constructor(url: string){
        this.esploraUrl = url;
    }

    async _call(method, params = []) {
        const requestData = {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: 1,
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        };

        try {
            const response = await fetch(this.esploraUrl, requestOptions);
            const responseData = await response.json();

            if (responseData.error) {
                console.error('Esplora JSON-RPC Error:', responseData.error);
                return null;
            }

            return responseData.result;
        } catch (error) {
            console.error('Request Error:', error);
            throw error;
        }
    }

    async getTxInfo (txid: string) {
        return await this._call("esplora_tx", [txid])
    }

    async getTxStatus (txid: string) {
        return await this._call("esplora_tx::status", [txid])
    }

    async getTxHex (txid: string) {
        return await this._call("esplora_tx::hex", [txid])
    }

    async getTxRaw (txid: string) {
        return await this._call("esplora_tx::raw", [txid])
    }

    async getTxOutspends (txid: string) {
        return await this._call("esplora_tx::outspends", [txid])
    }

    async getAddressTx (address: string) {
        return await this._call("esplora_address::txs", [address])
    }

    async getAddressUtxo (address: string) {
        return await this._call("esplora_address::utxo", [address])
    }
    async getFeeEstimates () {
        return await this._call("esplora_fee-estimates")
    }
}