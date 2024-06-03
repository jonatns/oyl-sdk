import * as bitcoin from 'bitcoinjs-lib';
export interface Account {
    taproot: {
        pubkey: string;
        pubKeyXOnly: string;
        privateKey: string;
        address: string;
    };
    nativeSegwit: {
        pubkey: string;
        privateKey: string;
        address: string;
    };
    nestedSegwit: {
        pubkey: string;
        privateKey: string;
        address: string;
    };
    legacy: {
        pubkey: string;
        privateKey: string;
        address: string;
    };
    spendStrategy: SpendStrategy;
    network: bitcoin.Network;
}
export type AddressType = 'nativeSegwit' | 'taproot' | 'nestedSegwit' | 'legacy';
export interface SpendStrategy {
    addressOrder: AddressType[];
    utxoSortGreatestToLeast: boolean;
    changeAddress: AddressType;
}
export interface MnemonicToAccountOptions {
    network?: bitcoin.networks.Network;
    index?: number;
    spendStrategy?: SpendStrategy;
}
export declare const generateMnemonic: () => string;
export declare const mnemonicToAccount: (mnemonic?: string, opts?: MnemonicToAccountOptions) => Account;
