curl --location 'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAMkCAAAAAnk5FXW5uAoTvsVlvigiK3ZSiSW8XCQj3sQN6iaTqz3DAQAAAAD/////anXDhBHRQVwH6wg4E0k5YG41PFYErhBromC6qcvPyoYAAAAAAP////8DqsQWAAAAAAAiUSANt0psJtTMreTV5pKqLCdzkQcRSZTqB1rNHBGXuIEr1SICAAAAAAAAIlEgaS1mV+2+3KmXYc3SmVvNgL675Ba8lojeXgl9yMZS6fAAAAAAAAAAAA5qXQsWAADw5Z0BCOgHAQAAAAAAAQErIgIAAAAAAAAiUSANt0psJtTMreTV5pKqLCdzkQcRSZTqB1rNHBGXuIEr1QEIQgFAqP4D+kkh9+yNUzIGL6zS6ELZAPTzpD04mQ3m1VLPgGSmnkE7Mntn2sAbsM2KlLJkF7reW3gkcy900zlpNWxkPwABASsK1BYAAAAAACJRIA23Smwm1Myt5NXmkqosJ3ORBxFJlOoHWs0cEZe4gSvVAQhCAUBgG9C5TdOsj2zDlDhT3x66XnvWxZgpCw8LiHvXzVj+xTnxDayoKp9xXyWtLqJ4pXacQtxhChP4ZkqhrkrV89geAAAAAA=="]
}' | jq .