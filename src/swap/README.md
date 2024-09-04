##  Processing Offers
To process an offer and execute a swap on a marketplace call ```processOffer()``` in ./index.ts. Most of the parameters in ```ProcessOfferOptions``` can be resolved with exported helper functions. E.g. see ```selectSpendAddress()``` which "selects" a spendAddress and its relative public key based on the estimated cost of the offer(s). If there are no exceptions, ```processOffer()``` returns a:
-  ```prepTx``` - which will contain a txId for transaction that creates dummy-utxos; otherwise ```null``` if there was no need to create dummy-utxos.  AND a:
- ```purchaseTx``` - which will contain a txId for a successful transaction.


Some marketplace apis have unique characteristics that need to be considered to avoid the process failing:

## Enforcing only confirmed utxos to bid on offers
  see       ```CONFIRMED_UTXO_ENFORCED_MARKETPLACES``` in ./helpers.ts
- Offers from these marketplaces will fail unless there is a confirmed UTXO to cover the amount
- Ideally should sort offers to make sure bids for these marketplaces are processed first to exhaust confirmed UTXOs on them
- To process other offers from marketplaces that don't enforce confirmed utxos requires to track every previous transaction before it and update a local record of utxos to get spendable utxos. See an implementation at ```updateUtxos()``` in ./helpers.ts

## Enforcing Dummy-Utxos to construct a Tx
  see ```DUMMY_UTXO_ENFORCED_MARKETPLACES``` in ./helpers.ts

  - If there isn't sufficient dummy-utxos, these marketplaces require them to be created first. This is automatically done in ```prepareAddressForDummyUtxos()```. 
  - If a dummy-utxo is created, the txId will be returned in ```prepTx```

## UTXO Management
 ```addressSpendables```, and other utxo methods can be very heavy; so to avoid calling them multiple times the ```processOffer()``` takes in a ```FormattedUtxo[]``` parameter. Ideally, getting spendable utxos should be done once, and updated locally with the txId and vout after each transaction. 
 
 In the case of ```CONFIRMED_UTXO_ENFORCED_MARKETPLACES``` it is not required since they also enforce confirmed(or spendable) utxos and you can call the utxo methods as many times as you want. However, in the case for marketplaces not included in ```CONFIRMED_UTXO_ENFORCED_MARKETPLACES```, IT IS REQUIRED to have some sort of mechanism to track  utxos in the mempool that were spawn from previous transactions in the swap process

