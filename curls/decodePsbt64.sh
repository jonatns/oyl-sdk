curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAH0CAAAAAVFPzCQVTbIiDBd+X8eb/IabFLUr4cqCnBUvkPtIuqM2AQAAAAD/////AugDAAAAAAAAIlEgoFjEyXO/4q/9a4OxcayNLtomxD4gYFOv5G3U3ehS0gHu6AAAAAAAABYAFB5ESWZpsBRPE45YzwKWWkrZMQNMAAAAAAABASua9gAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAQhCAUA7cc2imcSHT/lzBBjQ2/rwtLfsXhaz7k9lKn4598v+7ZsgZTmnfiUnmbICrwhWUqKRWjAL3AGftBi7hKT01lVfAAAA"]
}' | jq .