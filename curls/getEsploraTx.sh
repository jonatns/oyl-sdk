curl -s 'http://localhost:18888/v2/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["b531c471c04cab9b8ed38cb5f51c3726d9563d3fff6c0389273ac295315766b3"]
}' | jq .
