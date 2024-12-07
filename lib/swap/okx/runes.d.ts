import { GenOkxRuneUnsignedPsbt, OkxRuneListingData } from "../types";
import * as bitcoin from 'bitcoinjs-lib';
export declare function buildOkxRunesPsbt({ address, utxos, network, pubKey, orderPrice, sellerPsbt, addressType, sellerAddress, decodedPsbt, feeRate, receiveAddress }: GenOkxRuneUnsignedPsbt): Promise<string>;
export declare function generateRuneListingUnsignedPsbt(listingData: OkxRuneListingData, network: bitcoin.Network, pubKey: string): Promise<string>;
