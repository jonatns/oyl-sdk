curl --location 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAHECAAAAAT3kq8J1rS/P33IetgHTeTuEDKuiryxdmKa1km5j/39yAAAAAAD/////ApoCAAAAAAAAFgAUEMrLw09Ggf3bxotb5EZdi9xFwqdE0QEAAAAAABYAFMDOvNbD08qMddxexi6+VTMO+RDiAAAAAAABAR/A1AEAAAAAABYAFMDOvNbD08qMddxexi6+VTMO+RDiAAAA"]
}' | jq .