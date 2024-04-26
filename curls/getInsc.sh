curl -s 'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "ord_inscription",
    "params": ["615e568c9dd877635743439ea50df6fe11f6aef583f066fc2f917a1d62d03c5di0"]
}' | jq .
