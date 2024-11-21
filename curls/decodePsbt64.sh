curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAIACAAAAAXXLHzBY+pteIWVsOWk2cZhggTd5Ih1izG2OlYR4rgSXAAAAAAD/////AgAAAAAAAAAAGWpdFgIDBJTw/YXdBAEDBVQGAwoKCOgHFgEiAgAAAAAAACJRIDuCsrKpGFMV2m+A2l8G0EQNil4UV/qTOHwtkZyG7IeGAAAAAAABASughgEAAAAAACJRIGpzR/otQPXPT+x5dk74sQ3UxVxE4towSXQo0HYVJyisAQiQA0AgxDmzoBmdWH7p8VcQoskQDUXpV6IolhemSMnZeLi3EIbkydciq0igX24W4hDF+bo/4YtbUfTRcZg59eaDETKNKyA7grKyqRhTFdpvgNpfBtBEDYpeFFf6kzh8LZGchuyHhqwAYwUUeL/QJWghwTuCsrKpGFMV2m+A2l8G0EQNil4UV/qTOHwtkZyG7IeGAAAA"]
}' | jq .