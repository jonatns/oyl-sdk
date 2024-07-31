curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["86b1dc2f9322a18fb0f27d6accef5560efc88e00419114b0c5c8b6cf1ceb7fa5"]
}' | jq .
