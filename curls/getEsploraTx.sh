curl -s 'https://oylnet.oyl.gg/v2/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["5edbf9ec13bf64a6abf64ca65e8e6af00442d62d3f2a87e5d85270e657637498"]
}' | jq .
