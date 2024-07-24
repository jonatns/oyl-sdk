curl --location 'http://localhost:3000/v1/regtest' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAJoCAAAAAhqS2l7JNI9SVLV6dwcrWMkpGCbYazhtXRLEiIEQBqsCAAAAAAD/////50FQee+0TxJKM0Zo8X0x9ei0Jy7tzvOVv1eNJlt/3pUBAAAAAP////8CIgIAAAAAAAAWABQQysvDT0aB/dvGi1vkRl2L3EXCp/CrAQAAAAAAFgAUwM681sPTyox13F7GLr5VMw75EOIAAAAAAAEBKyICAAAAAAAAIlEgpghp8NvPHcZZyc7Lr4BQE16p6M3EhwU/HcaICUncaEwBCEIBQGINjL+VV+U2EnMKHZ6tYiU/GFBHYlrdEaEaPtNJmqE6UJHiCMyzG421/axFxvCtBOK8ZKJoCCKAmn3Dkl8WziAAAQEfzq8BAAAAAAAWABTAzrzWw9PKjHXcXsYuvlUzDvkQ4gEIbAJIMEUCIQD4KoQ40OA99VYb9c+BG76+fMosItOcIKBGDWX1Vwph9QIgdSnwRVvNfXxkHe5llRmSyUtVoKP6JMqOQR+MUn0NYG0BIQMw1U/Q3UIKbl+NNiT180gsrjUPedXwdTv1vu+cLZGvPAAAAA=="]
}' | jq .