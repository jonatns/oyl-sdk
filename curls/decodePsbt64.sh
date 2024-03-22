curl --location 'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAF4CAAAAAR9qyj7dOwhMBUepysTlIz8RdldnBRg5br4hsmu0TOEkAAAAAAD/////ASICAAAAAAAAIlEg/eihNk7a7HuulftNi+ZIqIz/eQdLHXxIYej8HaQ8IJoAAAAAAAEBK+oCAAAAAAAAIlEgJWN3buUm+CB8XFzJBozOXQlTLmHF+AtahkngOnO/TZsAAA=="]
}' | jq .