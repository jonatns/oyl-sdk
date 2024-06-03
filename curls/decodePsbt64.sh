curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAH0CAAAAAVFPzCQVTbIiDBd+X8eb/IabFLUr4cqCnBUvkPtIuqM2AQAAAAD/////AmQAAAAAAAAAIlEgDYnXAvr8EAq46uiQy69As1R9bxQpVkz11fjVF/TKo5Ae6wAAAAAAABYAFB5ESWZpsBRPE45YzwKWWkrZMQNMAAAAAAABASua9gAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAQhCAUCbJoHbpM6/5w02RpP50kbnsDgEpH7B8SRz6WMrnOWrPZL0cOvqXhA5+zNZbC1okJd92eIrZbfSJYseQScWKPfEAAAA"]
}' | jq .