import { Provider } from "../../provider"
import { AssetType } from "shared/interface"



export interface UnsignedOrdinalsWalletBid {
    address: string
    publicKey: string
    feeRate: number
    provider: Provider
    assetType: AssetType
    inscriptions?: string[]
    outpoints?:string[]
  }

export async function getSellerPsbt(unsignedBid: UnsignedOrdinalsWalletBid) {
    const {
        assetType, 
        address, 
        publicKey, 
        feeRate, 
        provider, 
        inscriptions, 
        outpoints
    } = unsignedBid;
    switch (assetType) {
        case AssetType.BRC20:
            return await provider.api.getOrdinalsWalletNftOfferPsbt({address, publicKey,feeRate, inscriptions})

        case AssetType.RUNES:
            return await provider.api.getOrdinalsWalletRuneOfferPsbt({address, publicKey,feeRate, outpoints})

        case AssetType.COLLECTIBLE:
            return await provider.api.getOrdinalsWalletNftOfferPsbt({address, publicKey,feeRate, inscriptions})
    }
}