import { ProcessOfferOptions, ProcessOfferResponse } from "../types";
export declare function processMagisatOffer({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }: ProcessOfferOptions): Promise<ProcessOfferResponse>;
