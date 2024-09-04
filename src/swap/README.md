##  Processing Offers
To process an offer and execute a swap on a marketplace call `processOffer()` in ./index.ts. Most of the parameters in `ProcessOfferOptions` can be resolved with exported helper functions. E.g. see `selectSpendAddress()` which "selects" a spendAddress and its relative public key based on the estimated cost of the offer(s). If there are no exceptions, `processOffer()` returns a:
-  `prepTx` - which will contain a txId for transaction that creates dummy-utxos; otherwise `null` if there was no need to create dummy-utxos.  AND a:
- `purchaseTx` - which will contain a txId for a successful transaction.


Some marketplace apis have unique characteristics that need to be considered to avoid the process failing:

## Distinguishing between Marketplaces that require confirmed UTXOs and those that do not.

Some marketplaces require that submitted offers only contain confirmed utxos as inputs. See `CONFIRMED_UTXO_ENFORCED_MARKETPLACES` in `./helpers.ts` for the list of marketplaces that require confirmed utxos.
- Offers from these marketplaces will fail unless there is/are enough confirmed UTXO(s) to cover the amount
- Ideally clients should sort the different marketplace offers to make sure bids for these marketplaces are processed first. That way, confirmed utxos are first used against these marketplace offers. The other marketplaces that allows unconfirmed inputs (utxos in mempool) can then use the outputs of these initial marketplace offers.
- To process other offers from marketplaces that don't enforce confirmed utxos requires clients to track the Oyl swap transactions that have been submitted for previous swaps and remain in the mempool. Utxos from these transactions can be used in swap transactions for marketplaces that allow unconfirmed utxos as inputs. See an example implementation at `updateUtxos()` in `./helpers.ts`

## Using Dummy UTXOs to construct a Tx

Some marketplaces require "dummy" utxos in their offer transactions. These are usually 600 sat utxos and are used to create proper inscription flows. See `DUMMY_UTXO_ENFORCED_MARKETPLACES` in ./helpers.ts for the list of marketplaces that use Dummy utxos

  - If an address does not have a sufficient number of dummy utxos (usually 2), then they must first be created.
  - If there are enought dummy utxos and spendable utxos, you can automatically create a properly formatted psbt using `prepareAddressForDummyUtxos()`.
  - If a dummy-utxo is created, the txId will be returned in `prepTx`

## UTXO Management
 `addressSpendables`, and other utxo methods can be very heavy; so to avoid calling them multiple times the `processOffer()` takes in a `FormattedUtxo[]` parameter. Ideally, getting spendable utxos should be done once, and updated locally with the txId and vout after each transaction. 
 
 In the case of `CONFIRMED_UTXO_ENFORCED_MARKETPLACES` IT IS NOT required since they also enforce confirmed(or spendable) utxos and you can call the utxo methods as many times as you want. However, in the case for marketplaces not included in `CONFIRMED_UTXO_ENFORCED_MARKETPLACES`, IT IS REQUIRED to have some sort of mechanism to track  utxos in the mempool that were spawn from previous transactions in the swap process

