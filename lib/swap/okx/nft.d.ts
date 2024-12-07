import { GenOkxBrcAndCollectibleUnsignedPsbt, OkxInscriptionListingData, PaymentUtxoOptions } from "../types";
import * as bitcoin from 'bitcoinjs-lib';
export declare function genBrcAndOrdinalUnsignedPsbt({ address, utxos, network, pubKey, orderPrice, sellerPsbt, feeRate, receiveAddress }: GenOkxBrcAndCollectibleUnsignedPsbt): string;
export declare function mergeSignedPsbt(signedBuyerPsbt: string, sellerPsbt: string[]): string;
export declare function buildDummyAndPaymentUtxos({ utxos, feeRate, orderPrice, address, receiveAddress, sellerPsbt }: PaymentUtxoOptions): {
    dummyUtxos: any[];
    paymentUtxos: any[];
};
export declare function generateInscriptionListingUnsignedPsbt(inscriptionListingData: OkxInscriptionListingData, network: bitcoin.Network, pubKey: string): Promise<string>;
