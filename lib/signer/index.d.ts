/// <reference types="node" />
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairInterface } from 'ecpair';
export declare const pathLegacy = "m/44'/1'/0'/0";
export declare const pathSegwitNested = "m/49'/1'/0'/0/0";
export declare const pathSegwit = "m/84'/1'/0'/0/0";
export declare const pathTaproot = "m/86'/1'/0'/0/0";
type walletInit = {
    privateKey: string;
    hdPath: string;
}[];
export declare class Signer {
    network: bitcoin.Network;
    keyPairs: ECPairInterface[];
    addresses: walletInit;
    constructor(network: bitcoin.Network, addresses: walletInit);
    SignInput({ rawPsbt, inputNumber, }: {
        rawPsbt: string;
        inputNumber: number;
    }): Promise<{
        signedPsbt: string;
    }>;
    SignTaprootInput({ rawPsbt, inputNumber, }: {
        rawPsbt: string;
        inputNumber: number;
    }): Promise<{
        signedPsbt: string;
    }>;
    SignAllTaprootInputs({ rawPsbt }: {
        rawPsbt: string;
    }): Promise<{
        signedPsbt: string;
    }>;
    SignAllInputs({ rawPsbt }: {
        rawPsbt: string;
    }): Promise<{
        signedPsbt: string;
    }>;
    SignMessage({ messageToSign, keyToUse, }: {
        messageToSign: string;
        keyToUse: number;
    }): Promise<Buffer>;
}
export {};
