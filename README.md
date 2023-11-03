# OYL-SDK

Utilities for core bitcoin wallet with client-side ordinal handling

## Getting Started

Clone from repository

Run `yarn`.

To build typescript files to js , just run `yarn build` or `tsc`. They do pretty much the same thing rn

## CLI Client (oyl-cli)
To use the command line client, you can install the package globally. In root dir of this repo, just run:

```
 npm i -g
```

The cli client is simply a layer over the oylib instance. commands can be found in cli.ts.


```
oyl-cli load
```

returns

```
{
  network: 'main',
  port: 8332,
  host: '198.199.72.193',
  apiKey: 'bikeshed'
}
```

It also accepts custom parameters:

```
oyl-cli load --port 8334
```
For more details see Wallet#fromProvider


To call methods on the object, pass in the method name in `snake-case` and add the parameter as a flag option also in `snake-case` :

```
oyl-cli get-address-summary --address bc1p527kv6mrq2sn5l7ukapq4q4a4puqfd9jsm7fv6r06c5726kyk57qnfvs4e
```

returns

```
[
  {
    "utxo": [
      {
        "tx_hash_big_endian": "96ea0ce6c073ff27d7c598c2b4929712e5ff6f68fdf7c1520253f8921d04a083",
        "tx_hash": "83a0041d92f8530252c1f7fd686fffe5129792b4c298c5d727ff73c0e60cea96",
        "tx_output_n": 0,
        "script": "5120a2bd666b6302a13a7fdcb7420a82bda87804b4b286fc96686fd629e56ac4b53c",
        "value": 10000,
        "value_hex": "2710",
        "confirmations": 10988,
        "tx_index": 4631145185697546
      }
    ],
    "balance": 0.0001
  }
]
```

Contributions, issues, PRs are all welcome.
