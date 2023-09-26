import * as bitcoin from 'bitcoinjs-lib';
import { AddressType } from '../shared/interface';
export declare function createWallet(hdPathString: string, type: AddressType): {};
export declare function publicKeyToAddress(publicKey: string, type: AddressType): string;
export declare function isValidAddress(address: string, network?: bitcoin.Network): boolean;
export declare function importMnemonic(mnemonic: string, path: string, type: AddressType): Promise<{}>;
