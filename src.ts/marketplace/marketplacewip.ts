import {
    Oyl,
    getAddressType,
    AddressType,
    OGPSBTTransaction,
    getNetwork,
    timeout,
    getSatpointFromUtxo,
} from '..'
import { BuildMarketplaceTransaction } from './buildMarketplaceTx'
import * as bitcoin from 'bitcoinjs-lib'
import {
    ExternalSwap,
    MarketplaceAccount,
    MarketplaceOffer,
    MarketplaceOffers,
} from '../shared/interface'
import { Signer } from '../signer';

export class Marketplace {
    private wallet: Oyl;
    private receiveAddress: string;
    private selectedSpendAddress: string | null;
    private selectedSpendPubkey: string | null;
    private spendAddress: string;
    private spendPubKey: string;
    private altSpendAddress: string;
    private altSpendPubKey: string;
    private signer: Signer;
    public feeRate: number;

    constructor(options: MarketplaceAccount) {
        this.wallet = options.wallet;
        this.receiveAddress = options.receiveAddress;
        this.spendAddress = options.spendAddress;
        this.spendPubKey = options.spendPubKey;
        this.altSpendAddress = options.altSpendAddress;
        this.altSpendPubKey = options.altSpendPubKey;
        this.signer = options.signer;
        this.feeRate = options.feeRate;
    }


    /**
     * Should estimate the total amount of satoshi required to execute offers including fees
     **/
    async getOffersCostEstimate(offers: MarketplaceOffer[]) {
        let costEstimate = 0
        for (let i = 0; i < offers.length; i++) {
            //50000 represents total fees, 546 for dust provision, 1200 for dummy utxos
            let offerPrice = offers[i]?.price
                ? offers[i].price
                : offers[i]?.totalPrice
            costEstimate += offerPrice + 50000 + 546 + 1200
        }
        return costEstimate
    }


    async selectSpendAddress(offers: MarketplaceOffer[]) {
        const estimatedCost = await this.getOffersCostEstimate(offers)
        if (await this.canAddressAffordOffers(this.spendAddress, estimatedCost)) {
            this.selectedSpendAddress = this.spendAddress;
            this.selectedSpendPubkey = this.spendPubKey;
        } else if (await this.canAddressAffordOffers(this.altSpendAddress, estimatedCost)) {
            this.selectedSpendAddress = this.altSpendAddress;
            this.selectedSpendPubkey = this.altSpendPubKey;
        } else {
            throw new Error('Not enough sats available to buy marketplace offers, need  ' +
                estimatedCost + ' sats');
        }
    }


    async processAllOffers(offers: MarketplaceOffer[]) {
        await this.selectSpendAddress(offers)
        const processedOffers = []
        let externalSwap = false
        const testnet = this.wallet.network == getNetwork('testnet')
        for (const offer of offers) {
            if (offer.marketplace == 'omnisat') {
                let newOffer = await this.wallet.apiClient.getOmnisatOfferPsbt({
                    offerId: offer.offerId,
                    ticker: offer.ticker,
                    testnet,
                })
                if (newOffer != false) {
                    processedOffers.push(newOffer)
                }
            } else if (offer.marketplace == 'unisat' && !testnet) {
                // let txId = await this.externalSwap({
                //   address: this.address,
                //   auctionId: offer.offerId,
                //   bidPrice: offer.totalPrice,
                //   pubKey: this.publicKey,
                //   mnemonic: this.mnemonic,
                //   hdPath: this.hdPath,
                //   type: this.addressType,
                // })
                // if (txId != null) processedOffers.push(txId)
                externalSwap = true
                await timeout(2000)
            }
        }
        if (processedOffers.length < 1) {
            throw new Error('Offers  unavailable')
        }
        return {
            processed: externalSwap,
            processedOffers,
        }
    }

    async canAddressAffordOffers(address: string, estimatedCost: number) {
        const retrievedUtxos = await this.getUTXOsToCoverAmount(address, estimatedCost);
        return retrievedUtxos.length > 0;
    }


    async getUnspentsForAddress(address: string) {
        try {
            '=========== Getting all confirmed/unconfirmed utxos for ' +
                address +
                ' ============'
            return await this.wallet.esploraRpc
                .getAddressUtxo(address)
                .then((unspents) => unspents?.filter((utxo) => utxo.value > 546))
        } catch (e: any) {
            throw new Error(e)
        }
    }

    async getUnspentsForAddressInOrderByValue(address: string) {
        const unspents = await this.getUnspentsForAddress(address)
        console.log('=========== Confirmed Utxos len', unspents.length)
        return unspents.sort((a, b) => b.value - a.value)
    }

    async getUTXOsToCoverAmount(
        address: string,
        amountNeeded: number,
        inscriptionLocs?: string[]
    ) {
        try {
            console.log(
                '=========== Getting Unspents for address in order by value ========'
            )
            const unspentsOrderedByValue =
                await this.getUnspentsForAddressInOrderByValue(address)
            console.log('unspentsOrderedByValue len:', unspentsOrderedByValue.length)
            console.log(
                '=========== Getting Collectibles for address ' +
                address +
                '========'
            )
            const retrievedIxs = (
                await this.wallet.apiClient.getCollectiblesByAddress(address)
            ).data
            console.log('=========== Collectibles:', retrievedIxs.length)
            console.log('=========== Gotten Collectibles, splitting utxos ========')
            const bisInscriptionLocs = retrievedIxs.map(
                (utxo) => utxo.satpoint
            ) as string[]

            if (bisInscriptionLocs.length === 0) {
                inscriptionLocs = []
            } else {
                inscriptionLocs = bisInscriptionLocs
            }

            let sum = 0
            const result: any = []
            for await (let utxo of unspentsOrderedByValue) {
                const currentUTXO = utxo
                const utxoSatpoint = getSatpointFromUtxo(currentUTXO)
                if (
                    (inscriptionLocs &&
                        inscriptionLocs?.find(
                            (utxoLoc: any) => utxoLoc === utxoSatpoint
                        )) ||
                    currentUTXO.value <= 546
                ) {
                    continue
                }
                sum += currentUTXO.value
                result.push(currentUTXO)
                if (sum > amountNeeded) {
                    console.log('AMOUNT RETRIEVED: ', sum)
                    return result
                }
            }
            return []
        } catch (e: any) {
            throw new Error(e)
        }
    }
}



