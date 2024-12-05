curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["23b8ff3c5ef56588353e143b3dac11d91eecddbb781ab2ef66171f359b0ebfda"]
}' | jq .
