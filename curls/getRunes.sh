curl -s 'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "ord_runes",
    "params": ["b25dfaeea88930616332bc97b9bde3bbfcfbe62e35e763a07cc4706a2be1ed17i0"]
}' | jq .
