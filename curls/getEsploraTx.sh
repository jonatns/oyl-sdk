curl -s 'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["a55f4d52e1620f05821634d42c4343ce1031b4ec58cdb44d061ae581af8fa2e5"]
}' | jq .
