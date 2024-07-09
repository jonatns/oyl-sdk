curl --location 'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094' \
--header 'Content-Type: application/json' \
--data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "btc_decodepsbt",
    "params": ["cHNidP8BAPECAAAAApLJlI6EjUBh843YB4+Myop4oJ8D0MXEDnFVtJepre0OAgAAAAD/////0ycvD2RxE7fD6hS4nAR/8rdVJNUabq0TiMIHFx10+tgFAAAAAP////8EECcAAAAAAAAiUSA8AUIu/Kt9zTsM3c670oLuPvI38GV1QvFO7vr0jobcdCICAAAAAAAAIlEg2u3cU5oZvMs6+Jrejv6b5mTrhPfA9mUS7JIPPM+eGGMAAAAAAAAAAAtqXQgA9KMzhwEKAT7HBAAAAAAAIlEg2u3cU5oZvMs6+Jrejv6b5mTrhPfA9mUS7JIPPM+eGGMAAAAAAAEBKyICAAAAAAAAIlEgPAFCLvyrfc07DN3Ou9KC7j7yN/BldULxTu769I6G3HQBFyBALpfDZZwLau0l6wZ76sIhfjsVWhsnUe++Kpbiuxzd2AABASvu9wQAAAAAACJRINrt3FOaGbzLOvia3o7+m+Zk64T3wPZlEuySDzzPnhhjARcgrXSjLIgqMeuAK/PepvL+tQLARyRhbngg+HYPdOmhonwAAAAAAA=="]
}' | jq .