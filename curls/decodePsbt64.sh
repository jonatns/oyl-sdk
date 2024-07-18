curl --location 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BANkCAAAAArVu4YXHJYx7y7qGimz5gHR0Cc7qJNcsplOCLAVlDxgmAQAAAAD/////JHvXaAR/+YE1v4K3OehG4zTL0l5zmcbzNlQDI+M9QdsAAAAAAP////8EIgIAAAAAAAAiUSCmCGnw288dxlnJzsuvgFATXqnozcSHBT8dxogJSdxoTCICAAAAAAAAFgAUEMrLw09Ggf3bxotb5EZdi9xFwqfs0AEAAAAAABYAFMDOvNbD08qMddxexi6+VTMO+RDiAAAAAAAAAAALal0IFgAAqgIBZAEAAAAAAAEBHyICAAAAAAAAFgAUwM681sPTyox13F7GLr5VMw75EOIBCGsCRzBEAiBfRJqUSuWKJ8giG0NPM6kAtzJJa/adQ6/oKjOF8Gf9EAIgGHKNHIn5tFPfehOxEmnN3K03Nq2zj+k76rgK1nZID+cBIQMw1U/Q3UIKbl+NNiT180gsrjUPedXwdTv1vu+cLZGvPAABASvA1AEAAAAAACJRIKYIafDbzx3GWcnOy6+AUBNeqejNxIcFPx3GiAlJ3GhMARcgzIpLxk2Je93F+8L2cPeougs4Z3kQbPEiPG/F181vwRUAAAAAAA=="]
}' | jq .