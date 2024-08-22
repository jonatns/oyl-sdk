curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAH0CAAAAAXSylcOFQbI1nskmceQS35wMCSdXaqjQywF8WPolLuJyAgAAAAD/////AvADAAAAAAAAIlEgW63qV6VtEZBgdBHKkxrK+ar/3iwfX0RKhsbatcsLVonigAEAAAAAABYAFMDOvNbD08qMddxexi6+VTMO+RDiAAAAAAABASmghgEAAAAAACC3+77b5htRv05B41F7gjLzHGTztn/9LY7s/xL8fbTK5QAAAA=="]
}' | jq .