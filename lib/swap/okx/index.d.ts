import { Signer } from "../../signer";
import { Provider } from "../../provider";
import { AssetType, MarketplaceOffer } from "../../shared/interface";
import { UnsignedOkxBid, SignedOkxBid, UnsignedPsbt } from "../types";
export declare function getSellerPsbt(unsignedBid: UnsignedOkxBid): Promise<any>;
export declare function submitSignedPsbt(signedBid: SignedOkxBid): Promise<any>;
export declare function getBuyerPsbt(unsignedPsbt: UnsignedPsbt): Promise<string>;
export declare function okxSwap({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, signer }: {
    address: string;
    offer: MarketplaceOffer;
    receiveAddress: string;
    feeRate: number;
    pubKey: string;
    assetType: AssetType;
    provider: Provider;
    signer: Signer;
}): Promise<any>;
