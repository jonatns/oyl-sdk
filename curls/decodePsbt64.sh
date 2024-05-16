curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAMgCAAAAAji92ADrvptuwgjoefSkoAOgE3XsQd/X3x0GyLvQk73BAAAAAAD/////7hrJi0FYtUbJ+xCTgMOdJcyUu8EhsUj16GEjneNdihICAAAAAP////8D8E4AAAAAAAAiUSANidcC+vwQCrjq6JDLr0CzVH1vFClWTPXV+NUX9MqjkCICAAAAAAAAIlEggsmd3+Warkah/ijQO55XkWHhNNdSKcP0LrPwcmCozXIAAAAAAAAAAA1qXQoWAADAojOOAWQBAAAAAAABASsiAgAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAQhCAUBzcvdX5lPDLQ0nhV2BpG90eYEXcdXFIVpxdPBX5rQj2guGVycnIEQBhYWOVq0aCiKmY4jasbyUb/BzNfAgH5AfAAEBK+BZAAAAAAAAIlEgDYnXAvr8EAq46uiQy69As1R9bxQpVkz11fjVF/TKo5ABCEIBQODpQzfSUV0yQpNUrY1vQUqdm7T4+t93QsBiSKUyQh2zle27XxXVVCuqmnw7p5uLu7ewJSVUXA8Vn9zUqG3h4d4AAAAA"]
}' | jq .