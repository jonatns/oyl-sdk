curl -s 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["158bf72f0c52a931b6fb2e95987e9f2695fc9136eeb4a430b963fbe3245af6e9"]
}' | jq .
