import fetch from 'node-fetch'


export class SandshrewBitcoinClient {
    public apiUrl: string

    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async _call(method, params = []) {
        const requestData = {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: Date.now(), // Use a unique identifier for each request
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        };

        try {
            const response = await fetch(this.apiUrl, requestOptions);
            const responseData = await response.json();

            if (responseData.error) {
                console.error('JSON-RPC Error:', responseData.error);
                return null;
            }

            return responseData.result;
        } catch (error) {
            console.error('Request Error:', error);
            throw error;
        }
    }
}

  // Example usage:
//   const bitcoinClient = new SandshrewBitcoinClient('http://localhost:8332');
