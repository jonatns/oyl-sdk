import { ProcessOfferOptions, ProcessOfferResponse } from "../types";
export declare function processMagicEdenOffer({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, receivePublicKey, signer }: ProcessOfferOptions): Promise<ProcessOfferResponse>;
