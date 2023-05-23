import * as bitcoin from 'bitcoinjs-lib';
export declare function createWallet(hdPathString: string): Promise<any>;
export declare function publicKeyToAddress(publicKey: string, type: string, networkType?: string): string;
export declare function isValidAddress(address: any, network?: bitcoin.Network): boolean;
