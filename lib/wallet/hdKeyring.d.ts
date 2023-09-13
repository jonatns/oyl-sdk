/// <reference types="node" />
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairInterface } from 'ecpair';
import bitcore from 'bitcore-lib';
import { EventEmitter } from 'events';
import Mnemonic from 'bitcore-mnemonic';
interface HDKeyringOption {
    hdPath?: string;
    mnemonic?: any;
    activeIndexes?: number[];
    passphrase?: string;
}
export declare class HdKeyring extends EventEmitter {
    mnemonic: any;
    passphrase: string;
    network: bitcoin.Network;
    hdPath: string;
    root: bitcore.HDPrivateKey;
    hdWallet?: Mnemonic;
    wallets: ECPairInterface[];
    private _index2wallet;
    activeIndexes: number[];
    constructor(opts?: HDKeyringOption);
    serialize(): Promise<HDKeyringOption>;
    resolve(_opts?: HDKeyringOption): Promise<void>;
    initFromMnemonic(mnemonic: string): void;
    changeHdPath(hdPath: string): void;
    getAccountByHdPath(hdPath: string, index: number): string;
    addAccounts(numberOfAccounts?: number): Promise<string[]>;
    activeAccounts(indexes: number[]): string[];
    getAddresses(start: number, end: number): {
        address: string;
        index: number;
    }[];
    getAccounts(): Promise<string[]>;
    private _getPrivateKeyFor;
    private _getWalletForAccount;
    signTransaction(psbt: bitcoin.Psbt, inputs: {
        index: number;
        publicKey: string;
        sighashTypes?: number[];
    }[], opts?: any): Promise<bitcoin.Psbt>;
    private _addressFromIndex;
}
export {};
