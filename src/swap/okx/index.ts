import { getAddressType } from "../.."
import { addressSpendableUtxos } from  '../../utxo/utxo';
import { Signer } from "../../signer"
import { Provider } from "../../provider"
import { AssetType, MarketplaceOffer } from "../../shared/interface"
import { UnsignedOkxBid, SignedOkxBid, UnsignedPsbt } from "../types"
import { genBrcAndOrdinalUnsignedPsbt, mergeSignedPsbt } from "./nft"
import { prepareAddressForDummyUtxos } from "swap/helpers";




export async function getSellerPsbt(unsignedBid: UnsignedOkxBid) {
    switch (unsignedBid.assetType) {
        case AssetType.BRC20:
            return await unsignedBid.provider.api.getOkxOfferPsbt({ offerId: unsignedBid.offerId })

        case AssetType.RUNES:
            return await unsignedBid.provider.api.getOkxOfferPsbt({ offerId: unsignedBid.offerId, rune: true })

        case AssetType.COLLECTIBLE:
            return await unsignedBid.provider.api.getOkxOfferPsbt({ offerId: unsignedBid.offerId })
    }
}


export async function submitSignedPsbt(signedBid: SignedOkxBid) {
    const offer = signedBid.offer
    switch (signedBid.assetType) {
        case AssetType.BRC20:
            const brcPayload = {
                ticker: offer.ticker,
                price: offer.totalPrice,
                amount: parseInt(offer.amount),
                fromAddress: signedBid.fromAddress,
                toAddress: offer.address,
                inscriptionId: offer.inscriptionId,
                buyerPsbt: signedBid.psbt,
                orderId: offer.offerId,
                brc20: true
            }
            return await signedBid.provider.api.submitOkxBid(brcPayload)

        case AssetType.RUNES:
            const runePayload = {
                fromAddress: signedBid.fromAddress,
                psbt: signedBid.psbt,
                orderId: offer.offerId,
            }
            return await signedBid.provider.api.submitOkxRuneBid(runePayload)

        case AssetType.COLLECTIBLE:
            const collectiblePayload = {
                ticker: offer.ticker,
                price: offer.totalPrice,
                amount: parseInt(offer.amount),
                fromAddress: signedBid.fromAddress,
                toAddress: offer.address,
                inscriptionId: offer.inscriptionId,
                buyerPsbt: signedBid.psbt,
                orderId: offer.offerId,
                brc20: false
            }
            return await signedBid.provider.api.submitOkxBid(collectiblePayload)

    }
}

export async function getBuyerPsbt(unsignedPsbt: UnsignedPsbt) {
    switch (unsignedPsbt.assetType) {
        case AssetType.BRC20:
            return genBrcAndOrdinalUnsignedPsbt(unsignedPsbt)
        case AssetType.RUNES:
            return
        case AssetType.COLLECTIBLE:
            return genBrcAndOrdinalUnsignedPsbt(unsignedPsbt)
            
    }
}



export async function okxSwap ({
    address, 
    offer,
    receiveAddress,
    feeRate,
    pubKey,
    assetType,
    provider,
    signer
}:{
    address: string
    offer: MarketplaceOffer
    receiveAddress: string
    feeRate: number
    pubKey: string
    assetType: AssetType
    provider: Provider
    signer: Signer
}) {
    const addressType = getAddressType(address);

    const psbtForDummyUtxos =
    (assetType != AssetType.RUNES) 
    ?
    await prepareAddressForDummyUtxos({address, provider, pubKey, feeRate, addressType})
    :
    null

    if (psbtForDummyUtxos != null){
        const {signedPsbt} = await signer.signAllInputs({
            rawPsbt: psbtForDummyUtxos,
            finalize: true,
        })
        const {txId} = await provider.pushPsbt({psbtBase64: signedPsbt})
        console.log("preptxid", txId)
    }
    const unsignedBid: UnsignedOkxBid = {
        offerId: offer.offerId,
        provider,
        assetType
    }
    
    const sellerData = await getSellerPsbt(unsignedBid);
    const sellerPsbt = sellerData.data.sellerPsbt;
    const network = provider.network
    const { utxos } = await addressSpendableUtxos({ address, provider });
    const buyerPsbt = await getBuyerPsbt({
        address,
        utxos,
        feeRate,
        receiveAddress,
        network,
        pubKey,
        addressType,
        sellerPsbt,
        orderPrice: offer.totalPrice,
        assetType
    })

   const {signedPsbt} = await signer.signAllInputs({
        rawPsbt: buyerPsbt,
        finalize: false
    })
    let finalPsbt = signedPsbt
    if (assetType != AssetType.RUNES) finalPsbt = mergeSignedPsbt(signedPsbt, [sellerPsbt]) 
    const transaction = await submitSignedPsbt({
        fromAddress: address,
        psbt: finalPsbt,
        assetType,
        provider,
        offer
    })
    if (transaction.statusCode == 200)return transaction.data

}