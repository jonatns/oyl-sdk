export declare const REGTEST_PARAMS: {
    bech32: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
};
export declare function getAddress(node: any, network: any): string;
export declare function getPrivate(mnemonic: any): Promise<import("bip32").BIP32Interface>;
export declare const ADDRESS_COMMANDS: {
    getprivate: any;
    getaddress: any;
};
