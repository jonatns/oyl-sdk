curl -s 'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["a6f484d9d7256ee6ac6a0171c3531897309798e8f71ccbc7af57a29878e1d262"]
}' | jq .
