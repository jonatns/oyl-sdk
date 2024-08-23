curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAKYCAAAAAjEsGwqcixp+bU9+XDoMm499Km49nBp+bE9bpOXJscPjAAAAAAD/////dLKVw4VBsjWeySZx5BLfnAwJJ1dqqNDLAXxY+iUu4nIAAAAAAP////8CIgIAAAAAAAAiUSDMikvGTYl73cX7wvZw96i6CzhneRBs8SI8b8XXzW/BFdKEAQAAAAAAFgAUwM681sPTyox13F7GLr5VMw75EOIAAAAAAAEBKyICAAAAAAAAIlEgDYnXAvr8EAq46uiQy69As1R9bxQpVkz11fjVF/TKo5AAAQEroIYBAAAAAAAiUSDMikvGTYl73cX7wvZw96i6CzhneRBs8SI8b8XXzW/BFQAAAA=="]
}' | jq .