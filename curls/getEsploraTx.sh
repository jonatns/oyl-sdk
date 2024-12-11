curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["ba677b39c89a7a73f6f58a0389744b1611f75302f760ad9e939c2327a74f8458"]
}' | jq .
