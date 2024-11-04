import { AssetType } from "../../shared/interface";
import { Signer } from '../../signer';
import { Provider } from "../../provider";
import { ProcessListingOptions, ProcessListingResponse, ProcessOfferOptions, ProcessOfferResponse } from "../types";
export interface UnsignedUnisatBid {
    address: string;
    auctionId: string | string[];
    bidPrice: number | number[];
    pubKey: string;
    receiveAddress: string;
    altAddressSignature?: string;
    feerate: number;
    provider: Provider;
    assetType: AssetType;
}
export interface SignedUnisatBid {
    psbtHex: string;
    auctionId: string;
    bidId: string;
    provider: Provider;
    assetType: AssetType;
}
export declare function getSellerPsbt(unsignedBid: UnsignedUnisatBid): Promise<any>;
export declare function submitBuyerPsbt(signedBid: SignedUnisatBid): Promise<any>;
export declare function processUnisatOffer({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }: ProcessOfferOptions): Promise<ProcessOfferResponse>;
export declare function processUnisatListing({ address, listing, receiveBtcAddress, pubKey, receiveBtcPubKey, assetType, provider, signer, }: ProcessListingOptions): Promise<ProcessListingResponse>;
export declare function getMessageSignature({ address, receiveAddress, signer, provider }: {
    address: string;
    receiveAddress: string;
    signer: Signer;
    provider: Provider;
}): Promise<string>;
