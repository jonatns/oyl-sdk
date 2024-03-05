/// <reference types="node" />
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairInterface } from 'ecpair';
type walletInit = {
    segwitPrivateKey?: string;
    taprootPrivateKey?: string;
};
export declare class Signer {
    network: bitcoin.Network;
    segwitKeyPair: ECPairInterface;
    taprootKeyPair: ECPairInterface;
    addresses: walletInit;
    constructor(network: bitcoin.Network, keys: walletInit);
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
        keyToUse: 'segwitKeyPair' | 'taprootKeyPair';
    }): Promise<Buffer>;
}
export {};
