import { UnsignedOkxBid, SignedOkxBid, UnsignedPsbt, ProcessOfferOptions, ProcessOfferResponse, ProcessListingOptions, ProcessListingResponse } from "../types";
export declare function getSellerPsbt(unsignedBid: UnsignedOkxBid): Promise<any>;
export declare function submitSignedPsbt(signedBid: SignedOkxBid): Promise<any>;
export declare function getBuyerPsbt(unsignedPsbt: UnsignedPsbt): Promise<string>;
export declare function processOkxOffer({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }: ProcessOfferOptions): Promise<ProcessOfferResponse>;
export declare function processOkxListing({ address, listing, receiveBtcAddress, pubKey, receiveBtcPubKey, assetType, provider, signer, }: ProcessListingOptions): Promise<ProcessListingResponse>;
