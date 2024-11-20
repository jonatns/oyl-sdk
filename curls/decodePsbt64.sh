curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAP0GAQIAAAADdrKVw4VBsjWeySZx5BLfnAwJJ1dqqNDLAXxY+iUu4nIAAAAAAP////93spXDhUGyNZ7JJnHkEt+cDAknV2qo0MsBfFj6JS7icgAAAAAA/////3SylcOFQbI1nskmceQS35wMCSdXaqjQywF8WPolLuJyAAAAAAD/////BAAAAAAAAAAAD2pdDBYBALPqAQHAjbcBAiICAAAAAAAAIlEgO4KysqkYUxXab4DaXwbQRA2KXhRX+pM4fC2RnIbsh4alkwEAAAAAABYAFNDEo+8J6Ze26Z45flGP4+QaEYyhanoBAAAAAAAWABTQxKPvCemXtumeOX5Rj+PkGhGMoQAAAAAAAQEfECcAAAAAAAAWABTQxKPvCemXtumeOX5Rj+PkGhGMoQABAR8FDQAAAAAAABYAFNDEo+8J6Ze26Z45flGP4+QaEYyhAAEBH6CGAQAAAAAAFgAU0MSj7wnpl7bpnjl+UY/j5BoRjKEAAAAAAA=="]
}' | jq .