import { AssetType } from "../../shared/interface";
import { Signer } from '../../signer';
import { Provider } from "../../provider";
import { ProcessOfferOptions, SwapResponse } from "swap/types";
export interface UnsignedUnisatBid {
    address: string;
    auctionId: string;
    bidPrice: number;
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
export declare function getPsbt(unsignedBid: UnsignedUnisatBid): Promise<any>;
export declare function submitPsbt(signedBid: SignedUnisatBid): Promise<any>;
export declare function unisatSwap({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }: ProcessOfferOptions): Promise<SwapResponse>;
export declare function getMessageSignature({ address, receiveAddress, signer, provider }: {
    address: string;
    receiveAddress: string;
    signer: Signer;
    provider: Provider;
}): Promise<string>;
