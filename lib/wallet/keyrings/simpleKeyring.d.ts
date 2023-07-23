/// <reference types="node" />
/// <reference types="node" />
import * as bitcoin from "bitcoinjs-lib";
import { EventEmitter } from "events";
import { ECPairInterface } from "ecpair";
export declare const toXOnly: (pubKey: Buffer) => Buffer;
export declare class SimpleKeyring extends EventEmitter {
    network: bitcoin.Network;
    wallets: ECPairInterface[];
    constructor(opts?: any);
    serialize(): Promise<any>;
    deserialize(opts: any): Promise<void>;
    addAccounts(n?: number): Promise<string[]>;
    getAccounts(): Promise<string[]>;
    signTransaction(psbt: bitcoin.Psbt, inputs: {
        index: number;
        publicKey: string;
        sighashTypes?: number[];
    }[], opts?: any): Promise<bitcoin.Psbt>;
    signMessage(publicKey: string, text: string): Promise<any>;
    verifyMessage(publicKey: string, text: string, sig: string): Promise<any>;
    private _getPrivateKeyFor;
    exportAccount(publicKey: string): Promise<string>;
    removeAccount(publicKey: string): void;
    private _getWalletForAccount;
}
