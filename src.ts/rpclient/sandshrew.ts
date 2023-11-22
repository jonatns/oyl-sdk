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

    _createRpcMethod(methodName, argType) {
        this[methodName] = async (...args) => {
            const convertedArgs = args.map((arg, index) => {
                return this._convertArg(arg, argType);
            });

            return this._call(methodName, convertedArgs);
        };
    }

    _convertArg(arg, argType) {
        switch (argType) {
            case 'str':
                return arg.toString();
            case 'int':
                return parseFloat(arg);
            case 'float':
                return parseFloat(arg);
            case 'bool':
                return (arg === true || arg == '1' || arg == 'true' || arg.toString().toLowerCase() == 'true');
            case 'obj':
                if (typeof arg === 'string') {
                    return JSON.parse(arg);
                }
                return arg;
            default:
                return arg;
        }
    }
}

  // Example usage:
//   const bitcoinClient = new SandshrewBitcoinClient('http://localhost:8332');
