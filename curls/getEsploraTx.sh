curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["d0c21b35f27ba6361acd5172fcfafe8f4f96d424c80c00b5793290387bcbcf44"]
}' | jq .
