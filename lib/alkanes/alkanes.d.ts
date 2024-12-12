/// <reference types="node" />
import { Provider } from '../provider/provider';
import * as bitcoin from 'bitcoinjs-lib';
import { Account } from '../account/account';
import { GatheredUtxos } from '../shared/interface';
import { Signer } from '../signer';
export declare const createExecutePsbt: ({ gatheredUtxos, account, calldata, provider, feeRate, fee, }: {
    gatheredUtxos: GatheredUtxos;
    account: Account;
    calldata: bigint[];
    provider: Provider;
    feeRate?: number;
    fee?: number;
}) => Promise<{
    psbt: string;
    psbtHex: string;
}>;
export declare const createDeployCommit: ({ gatheredUtxos, tweakedTaprootKeyPair, account, provider, feeRate, fee, }: {
    gatheredUtxos: GatheredUtxos;
    tweakedTaprootKeyPair: bitcoin.Signer;
    account: Account;
    provider: Provider;
    feeRate?: number;
    fee?: number;
}) => Promise<{
    psbt: string;
    script: Buffer;
}>;
export declare const createDeployReveal: ({ receiverAddress, script, feeRate, tweakedTaprootKeyPair, provider, fee, commitTxId, }: {
    receiverAddress: string;
    script: Buffer;
    feeRate: number;
    tweakedTaprootKeyPair: bitcoin.Signer;
    provider: Provider;
    fee?: number;
    commitTxId: string;
}) => Promise<{
    psbt: string;
    psbtHex: string;
    fee: number;
}>;
export declare const actualDeployCommitFee: ({ tweakedTaprootKeyPair, gatheredUtxos, account, provider, feeRate, signer, }: {
    tweakedTaprootKeyPair: bitcoin.Signer;
    gatheredUtxos: GatheredUtxos;
    account: Account;
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    fee: number;
}>;
export declare const actualDeployRevealFee: ({ tweakedTaprootKeyPair, commitTxId, receiverAddress, script, account, provider, feeRate, signer, }: {
    tweakedTaprootKeyPair: bitcoin.Signer;
    taprootKeyPair: bitcoin.Signer;
    commitTxId: string;
    receiverAddress: string;
    script: Buffer;
    account: Account;
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    fee: number;
}>;
export declare const actualExecuteFee: ({ gatheredUtxos, account, calldata, provider, feeRate, }: {
    gatheredUtxos: GatheredUtxos;
    account: Account;
    calldata: bigint[];
    provider: Provider;
    feeRate: number;
}) => Promise<{
    fee: number;
}>;
export declare const deployCommit: ({ gatheredUtxos, account, provider, feeRate, signer, }: {
    gatheredUtxos: GatheredUtxos;
    account: Account;
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    script: string;
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: number;
    satsPerVByte: string;
}>;
export declare const deployReveal: ({ commitTxId, script, account, provider, feeRate, signer, }: {
    commitTxId: string;
    script: string;
    account: Account;
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: number;
    satsPerVByte: string;
}>;
export declare const execute: ({ gatheredUtxos, account, calldata, provider, feeRate, signer, }: {
    gatheredUtxos: GatheredUtxos;
    account: Account;
    calldata: bigint[];
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: number;
    satsPerVByte: string;
}>;
