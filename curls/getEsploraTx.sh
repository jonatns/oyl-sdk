curl -s 'http://localhost:18888/v2/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["46d631259292b412ea4d816c5a4f65f2962899ced10fb378deb74cdc0c276708"]
}' | jq .
