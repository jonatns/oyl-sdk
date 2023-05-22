import { SimpleKeyring } from "./simpleKeyring";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairInterface } from "ecpair";
import bitcore from "bitcore-lib";
import Mnemonic from "bitcore-mnemonic";
interface DeserializeOption {
    hdPath?: string;
    mnemonic?: any;
    activeIndexes?: number[];
    passphrase?: string;
}
export declare class HdKeyring extends SimpleKeyring {
    static type: string;
    type: string;
    mnemonic: any;
    passphrase: string;
    network: bitcoin.Network;
    hdPath: string;
    root: bitcore.HDPrivateKey;
    hdWallet?: Mnemonic;
    wallets: ECPairInterface[];
    private _index2wallet;
    activeIndexes: number[];
    page: number;
    perPage: number;
    constructor(opts?: DeserializeOption);
    serialize(): Promise<DeserializeOption>;
    deserialize(_opts?: DeserializeOption): Promise<void>;
    initFromMnemonic(mnemonic: string): void;
    changeHdPath(hdPath: string): void;
    getAccountByHdPath(hdPath: string, index: number): string;
    addAccounts(numberOfAccounts?: number): Promise<string[]>;
    activeAccounts(indexes: number[]): string[];
    getFirstPage(): Promise<{
        address: string;
        index: number;
    }[]>;
    getNextPage(): Promise<{
        address: string;
        index: number;
    }[]>;
    getPreviousPage(): Promise<{
        address: string;
        index: number;
    }[]>;
    getAddresses(start: number, end: number): {
        address: string;
        index: number;
    }[];
    __getPage(increment: number): Promise<{
        address: string;
        index: number;
    }[]>;
    getAccounts(): Promise<string[]>;
    getIndexByAddress(address: string): number;
    private _addressFromIndex;
}
export {};
