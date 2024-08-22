curl -s 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["f5f12ea6155380dacca5c0e0b5de5f58cb1d8435c00cf36050f7efee04443e11"]
}' | jq .
