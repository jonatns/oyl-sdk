curl --location 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAH0CAAAAAe+MaNn/gSofWq9eNcLogvq1l+BRf+9Gu+F19c7/SVEoAQAAAAD/////AugDAAAAAAAAIlEgqC8plE1luGrmteXMdeKU6tbFk5Gh7cXgFuNJjGf8e7touQEAAAAAABYAFMDOvNbD08qMddxexi6+VTMO+RDiAAAAAAABAR8UxwEAAAAAABYAFMDOvNbD08qMddxexi6+VTMO+RDiAQhrAkcwRAIgcaF479plpJqaS/ONdos3QebXbTnpFMDnr75JMnvIhQgCIFFxE4VEENIObl9+gFL+gT8YiIFxERi31Eprtxwa8Zf8ASEDMNVP0N1CCm5fjTYk9fNILK41D3nV8HU79b7vnC2RrzwAAAA="]
}' | jq .