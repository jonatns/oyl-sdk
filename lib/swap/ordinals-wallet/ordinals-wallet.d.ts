import { MarketplaceOffer } from "swap/types";
import { Provider } from "../../provider";
import { AssetType } from "shared/interface";
import { FormattedUtxo } from '../../utxo/utxo';
import { Signer } from "../../signer";
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
export declare function ordinalWalletSwap({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }: {
    address: string;
    offer: MarketplaceOffer;
    receiveAddress: string;
    feeRate: number;
    pubKey: string;
    utxos: FormattedUtxo[];
    assetType: AssetType;
    provider: Provider;
    signer: Signer;
}): Promise<any>;
