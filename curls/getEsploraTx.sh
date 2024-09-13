curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["8913339817f6d81236bb0d550db203faac55490d5f7bf6a09597397ba04f5dbf"]
}' | jq .
