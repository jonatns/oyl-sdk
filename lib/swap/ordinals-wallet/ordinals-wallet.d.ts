import { Provider } from "../../provider";
import { AssetType } from "shared/interface";
export interface UnsignedOrdinalsWalletBid {
    address: string;
    publicKey: string;
    feeRate: number;
    provider: Provider;
    assetType: AssetType;
    inscriptions?: string[];
    outpoints?: string[];
}
export interface signedOrdinalsWalletBid {
    psbt: string;
    provider: Provider;
    assetType: AssetType;
}
export declare function getSellerPsbt(unsignedBid: UnsignedOrdinalsWalletBid): Promise<any>;
export declare function submitPsbt(signedBid: signedOrdinalsWalletBid): Promise<any>;
