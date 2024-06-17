curl --location 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_getrawtransaction",
    "params": ["3ba0c6aa21a49d644920b249c11812eb203bc33a1b8c3c60fe12b0f31853539f"]
}' | jq .