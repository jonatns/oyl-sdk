curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["9f605f5c902c9c9fcf87bca757c4f5048bb97a32448547851d826c43f773ad35"]
}' | jq .
