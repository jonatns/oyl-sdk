curl -s 'http://localhost:18888/v2/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["ca6de56f5439cf579265505a4331cc2d0c398f9efe671677570a07b91a952c29"]
}' | jq .
