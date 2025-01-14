curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["73ff0ffd16accf7e8e98f92477e7e14377566226e4ae11e82afebc05a2a8825f"]
}' | jq .
