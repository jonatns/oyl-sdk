import * as bitcoin from 'bitcoinjs-lib';
export type Account = {
    taproot: {
        pubkey: string;
        pubKeyXOnly: string;
        address: string;
    };
    nativeSegwit: {
        pubkey: string;
        address: string;
    };
    nestedSegwit: {
        pubkey: string;
        address: string;
    };
    legacy: {
        pubkey: string;
        address: string;
    };
    spendStrategy: SpendStrategy;
    network: bitcoin.Network;
};
export type AddressKey = 'nativeSegwit' | 'taproot' | 'nestedSegwit' | 'legacy';
export type DerivationMode = 'bip44_account_last' | 'bip44_standard' | 'bip32_simple';
export type DerivationPaths = {
    legacy?: string;
    nestedSegwit?: string;
    nativeSegwit?: string;
    taproot?: string;
};
export interface SpendStrategy {
    addressOrder: AddressKey[];
    utxoSortGreatestToLeast: boolean;
    changeAddress: AddressKey;
}
export interface MnemonicToAccountOptions {
    network?: bitcoin.networks.Network;
    index?: number;
    spendStrategy?: SpendStrategy;
    derivationPaths?: DerivationPaths;
}
export declare const generateMnemonic: () => string;
export declare const validateMnemonic: (mnemonic: string) => boolean;
export declare const mnemonicToAccount: ({ mnemonic, opts, }: {
    mnemonic?: string;
    opts?: MnemonicToAccountOptions;
}) => {
    taproot: {
        pubkey: string;
        pubKeyXOnly: string;
        address: string;
    };
    nativeSegwit: {
        pubkey: string;
        address: string;
    };
    nestedSegwit: {
        pubkey: string;
        address: string;
    };
    legacy: {
        pubkey: string;
        address: string;
    };
    spendStrategy: SpendStrategy;
    network: bitcoin.networks.Network;
};
export declare const getDerivationPaths: (index?: number, network?: bitcoin.networks.Network, derivationMode?: DerivationMode) => DerivationPaths;
export declare const generateWallet: ({ mnemonic, opts, }: {
    mnemonic?: string;
    opts: MnemonicToAccountOptions;
}) => {
    taproot: {
        pubkey: string;
        pubKeyXOnly: string;
        address: string;
    };
    nativeSegwit: {
        pubkey: string;
        address: string;
    };
    nestedSegwit: {
        pubkey: string;
        address: string;
    };
    legacy: {
        pubkey: string;
        address: string;
    };
    spendStrategy: SpendStrategy;
    network: bitcoin.networks.Network;
};
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
