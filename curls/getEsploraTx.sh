curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["ca3eff047010af7398125db29951ecaac1b0696a73a60007a6959a30b071551b"]
}' | jq .
