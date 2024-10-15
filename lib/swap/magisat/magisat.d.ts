import { ProcessOfferOptions, SwapResponse } from "../types";
export declare function magisatSwap({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }: ProcessOfferOptions): Promise<SwapResponse>;
