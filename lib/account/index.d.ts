import * as bitcoin from 'bitcoinjs-lib';
export type Account = {
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
};
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
export declare const mnemonicToAccount: ({ mnemonic, opts, }: {
    mnemonic?: string;
    opts?: MnemonicToAccountOptions;
}) => Account;
export declare const getWalletPrivateKeys: ({ mnemonic, opts, }: {
    mnemonic: string;
    opts?: MnemonicToAccountOptions;
}) => {
    taproot: {
        privateKey: string;
    };
    nativeSegwit: {
        privateKey: string;
    };
    nestedSegwit: {
        privateKey: string;
    };
    legacy: {
        privateKey: string;
    };
};
