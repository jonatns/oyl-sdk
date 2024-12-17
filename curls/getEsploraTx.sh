curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["eda6cff495bbe0984f9cf8038af2ad4207dcd27d5833b4f89b4e1bd5376bd519"]
}' | jq .
