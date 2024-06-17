curl --location 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAH0CAAAAAZ9TUxjzsBL+YDyMGzrDOyDrEhjBSbIgSWSdpCGqxqA7AAAAAAD/////AlYDAAAAAAAAIlEguZhvZoBqxXN+irpQPDan4mkEwvebwgN8ov8JfAn71uO8zgEAAAAAABYAFMDOvNbD08qMddxexi6+VTMO+RDiAAAAAAABAR/A1AEAAAAAABYAFMDOvNbD08qMddxexi6+VTMO+RDiAQhrAkcwRAIgAKyk7md8laxrWWDUS9GLOs2xplgmcFAm/MjEU8B9N/sCIHTxEZx8YPODV2dKo6+bD7LzTtBKrB2gzPKXQxfVdkktASEDMNVP0N1CCm5fjTYk9fNILK41D3nV8HU79b7vnC2RrzwAAAA="]
}' | jq .