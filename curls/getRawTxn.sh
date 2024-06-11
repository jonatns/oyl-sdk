curl --location 'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_getrawtransaction",
    "params": ["e270945e89fbf3ad135dfcdd732453e01d009328e206b47036cac868e9d5129c"]
}' | jq .