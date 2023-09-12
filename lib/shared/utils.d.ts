/// <reference types="node" />
import * as bitcoin from "bitcoinjs-lib";
export declare const ECPair: import("ecpair").ECPairAPI;
export declare const toXOnly: (pubKey: Buffer) => Buffer;
export declare function tweakSigner(signer: bitcoin.Signer, opts?: any): bitcoin.Signer;
export declare function satoshisToAmount(val: number): string;
export declare function amountToSatoshis(val: any): number;
export declare const validator: (pubkey: Buffer, msghash: Buffer, signature: Buffer) => boolean;
