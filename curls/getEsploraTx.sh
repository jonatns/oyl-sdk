curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["285149ffcef575e1bb46ef7f51e097b5fa82e8c2355eaf5a1f2a81ffd9688cef"]
}' | jq .
