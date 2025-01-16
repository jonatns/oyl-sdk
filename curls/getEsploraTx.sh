curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["c7828990c852a5398ed706a2ffa72b9f74fdbb751a439e4ef0b137db97aa35bd"]
}' | jq .
