curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAH0CAAAAAVFPzCQVTbIiDBd+X8eb/IabFLUr4cqCnBUvkPtIuqM2AQAAAAD/////AmQAAAAAAAAAIlEgDYnXAvr8EAq46uiQy69As1R9bxQpVkz11fjVF/TKo5By7AAAAAAAABYAFB5ESWZpsBRPE45YzwKWWkrZMQNMAAAAAAABASua9gAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAQhCAUCjEXBELNxD8fTKTIlOhinmgTZIkYE5xEfSxTgy+SdGYeVsnDSFDhqOVsAKPUZuWFEAddQ5MqlqI54YOv7cXPAAAAAA"]
}' | jq .