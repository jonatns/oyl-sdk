curl --location 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decoderawtransaction",
    "params": ["0200000001025fefb2c9fe12e4080055e48555ac27a8bbd223ab24ed1864a4b46366c6ce26000000006b483045022100cd207233dc06dcecf1a3692f51082cb0fb397a62cb2b4cac08c4b6f32809445402203eacd9a24dd2db33fecddd975955c5863fa5a08518b07c72ec123d94f8da8dac012103aaeb52dd7494c361049de67cc680e83ebcbbbdbeb13637d92cd845f70308af5effffffff022202000000000000160014c0cebcd6c3d3ca8c75dc5ec62ebe55330ef910e2b408000000000000160014c0cebcd6c3d3ca8c75dc5ec62ebe55330ef910e200000000"]
}' | jq .