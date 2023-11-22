import fetch from 'node-fetch'

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
}