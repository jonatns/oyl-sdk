curl -s 'https://oylnet.oyl.gg/v2/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "esplora_tx",
    "params": ["10e66bb020f42bf12f7371877ff5c34b2daa92044a4339df893ba2632705ed40"]
}' | jq .
