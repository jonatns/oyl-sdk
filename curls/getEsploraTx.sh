curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["c92cea483024348b952d9113a6085105255a8a643116a322e26c1651ba2faaae"]
}' | jq .
