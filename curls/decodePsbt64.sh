curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAIkCAAAAAe4ayYtBWLVGyfsQk4DDnSXMlLvBIbFI9ehhI53jXYoSAgAAAAD/////AjIAAAAAAAAAIlEgLU7VSBxqf44cWVA/vKir1HhXBEyzTd2ClaGYlGlP2mUwUgAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAAAAAAABASvgWQAAAAAAACJRIA2J1wL6/BAKuOrokMuvQLNUfW8UKVZM9dX41Rf0yqOQAQhCAUANG+DFnSkXWa2SNsO0uJRl6nge4WS6nFNydpMNWCkRM5XyYXElVv20Jlsq4VxSLtHgi+qCYFx1tdxUdaWeXnnlAAAA"]
}' | jq .