/// <reference types="node" />
import * as bitcoin from 'bitcoinjs-lib';
import { UnspentOutput, TxInput, Network, BitcoinPaymentType } from '../shared/interface';
export declare const ECPair: import("ecpair").ECPairAPI;
export declare const assertHex: (pubKey: Buffer) => Buffer;
export declare function getNetwork(value: Network): bitcoin.networks.Network;
export declare function checkPaymentType(payment: bitcoin.PaymentCreator, network: Network): (script: Buffer) => false | bitcoin.payments.Payment;
export declare function tweakSigner(signer: bitcoin.Signer, opts?: any): bitcoin.Signer;
export declare function satoshisToAmount(val: number): string;
export declare function amountToSatoshis(val: any): number;
export declare const validator: (pubkey: Buffer, msghash: Buffer, signature: Buffer) => boolean;
export declare function utxoToInput(utxo: UnspentOutput, publicKey: Buffer): TxInput;
export declare const getWitnessDataChunk: (content: string, encodeType?: BufferEncoding) => Buffer[];
export declare const getSatpointFromUtxo: (utxo: any) => string;
export declare const isP2PKH: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const isP2WPKH: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const isP2WSHScript: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const isP2SHScript: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const isP2TR: (script: Buffer, network: Network) => BitcoinPaymentType;
