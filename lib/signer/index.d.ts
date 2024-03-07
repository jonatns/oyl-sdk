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
    SignInput({ rawPsbt, inputNumber, finalize, }: {
        rawPsbt: string;
        inputNumber: number;
        finalize: boolean;
    }): Promise<{
        signedPsbt: string;
    }>;
    SignTaprootInput({ rawPsbt, inputNumber, finalize, }: {
        rawPsbt: string;
        inputNumber: number;
        finalize: boolean;
    }): Promise<{
        signedPsbt: string;
    }>;
    SignAllTaprootInputs({ rawPsbt, finalize, }: {
        rawPsbt: string;
        finalize: boolean;
    }): Promise<{
        signedPsbt: string;
    }>;
    SignAllInputs({ rawPsbt, finalize, }: {
        rawPsbt: string;
        finalize: boolean;
    }): Promise<{
        signedPsbt: string;
    }>;
    SignMessage({ messageToSign, keyToUse, }: {
        messageToSign: string;
        keyToUse: 'segwitKeyPair' | 'taprootKeyPair';
    }): Promise<Buffer>;
}
export {};
