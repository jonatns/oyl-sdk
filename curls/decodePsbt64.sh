curl --location 'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAKYCAAAAAmmL30CjKlcwvzln/J3XD8MXIZVSzJ3siHirNxCw9ZuGAAAAAAD/////zIfFPGAkPRIL5NzwJHSkxgqH65KwHeeGxQOsZ7dBUFYAAAAAAP////8C6AMAAAAAAAAiUSCCyZ3f5ZquRqH+KNA7nleRYeE011Ipw/Qus/ByYKjNcrwHAAAAAAAAFgAUHAtyVOwgm7XoLM1ozVxpi1zFt6wAAAAAAAEBH04MAAAAAAAAFgAUHAtyVOwgm7XoLM1ozVxpi1zFt6wAAQEfTgwAAAAAAAAWABQcC3JU7CCbtegszWjNXGmLXMW3rAAAAA=="]
}' | jq .