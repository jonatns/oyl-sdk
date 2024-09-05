import { UnsignedOkxBid, SignedOkxBid, UnsignedPsbt, ProcessOfferOptions, SwapResponse } from "../types";
export declare function getSellerPsbt(unsignedBid: UnsignedOkxBid): Promise<any>;
export declare function submitSignedPsbt(signedBid: SignedOkxBid): Promise<any>;
export declare function getBuyerPsbt(unsignedPsbt: UnsignedPsbt): Promise<string>;
export declare function okxSwap({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }: ProcessOfferOptions): Promise<SwapResponse>;
