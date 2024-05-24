export declare const generateWallet: (testnet: boolean, mnemonic?: string, index?: number) => {
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
};
