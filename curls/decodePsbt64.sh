curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BALQCAAAAAZH7woare+PMAyHKd05qRNnU3+iGCUgNPtOVsjE3V7QjAAAAAAD/////A1gCAAAAAAAAIlEg2u3cU5oZvMs6+Jrejv6b5mTrhPfA9mUS7JIPPM+eGGNYAgAAAAAAACJRINrt3FOaGbzLOvia3o7+m+Zk64T3wPZlEuySDzzPnhhjoKAFAAAAAAAiUSDa7dxTmhm8yzr4mt6O/pvmZOuE98D2ZRLskg88z54YYwAAAAAAAQErgBoGAAAAAAAiUSBmAvD3I2rkIRTB6gEvNyWTFDn5kL6kSvpJtRTEUYB2SAEXINrt3FOaGbzLOvia3o7+m+Zk64T3wPZlEuySDzzPnhhjAAAAAA=="]
}' | jq .