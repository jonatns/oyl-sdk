curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["9efb19c3eb185e53df9b927a917cf5f2b41beaded55dcb90abe039b5cc76f6a9"]
}' | jq .
