curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["2152cced119f806471fcf4188d28a21458fd8256c6c73be42bb7987a7f0dc407"]
}' | jq .
