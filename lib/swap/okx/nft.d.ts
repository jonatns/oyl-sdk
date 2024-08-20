import { GenBrcAndCollectibleUnsignedPsbt, PaymentUtxoOptions } from "../types";
export declare function genBrcAndOrdinalUnsignedPsbt({ address, utxos, network, pubKey, orderPrice, sellerPsbt, feeRate, receiveAddress }: GenBrcAndCollectibleUnsignedPsbt): string;
export declare function mergeSignedPsbt(signedBuyerPsbt: string, sellerPsbt: string[]): string;
export declare function buildDummyAndPaymentUtxos({ utxos, feeRate, orderPrice, address, receiveAddress, sellerPsbt }: PaymentUtxoOptions): {
    dummyUtxos: any[];
    paymentUtxos: any[];
};
