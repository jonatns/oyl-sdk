curl -s 'https://mainnet.sandshrew.io/v2/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "ord_outputs",
    "params": ["bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm?type=runic"]
}' | jq .
