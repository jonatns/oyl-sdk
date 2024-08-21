import { GenOkxRuneUnsignedPsbt } from "../types";
export declare function buildOkxRunesPsbt({ address, utxos, network, pubKey, orderPrice, sellerPsbt, addressType, sellerAddress, decodedPsbt, feeRate, receiveAddress }: GenOkxRuneUnsignedPsbt): Promise<string>;
export declare function simulateRunesBuy(sellerAddress: any, receieveAddress: any, utxos: any, orderPrice: any): void;
