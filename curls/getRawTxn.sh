curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_getrawtransaction",
    "params": ["5311587aa57fc377211fd2817e333536f913cd343c89bfc889bb4eabbd7ff5a9"]
}' | jq .
