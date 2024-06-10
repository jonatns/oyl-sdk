curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAKYCAAAAAinGMwjO02ofVqWNR04Vwpy30CEftcOqNUyIgKZGyA3AJgEAAAD/////UU/MJBVNsiIMF35fx5v8hpsUtSvhyoKcFS+Q+0i6ozYBAAAAAP////8CIgIAAAAAAAAiUSCgWMTJc7/ir/1rg7FxrI0u2ibEPiBgU6/kbdTd6FLSAaLpAAAAAAAAFgAUHkRJZmmwFE8TjljPApZaStkxA0wAAAAAAAEBKyICAAAAAAAAIlEgDYnXAvr8EAq46uiQy69As1R9bxQpVkz11fjVF/TKo5ABCEIBQIcHv76gWcpMmRnxUuJJy+PBR6bCsDGD3Kt0OH2hT4Hp7L3jpfZBOq5p7tHwEuXGc1LloYCP+KPb9ki6YhGcTbgAAQErmvYAAAAAAAAiUSANidcC+vwQCrjq6JDLr0CzVH1vFClWTPXV+NUX9MqjkAEIQgFAbn76P8MsI58YRN7jRR85pStiYOMQqjdBZoc7qdNz80913LMGG690vZ1LYT/nJAEo8+WK9QhDQ3exGY+wR+JDoAAAAA=="]
}' | jq .