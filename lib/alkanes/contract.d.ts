/// <reference types="node" />
/// <reference types="node" />
import { Account, Signer, Provider } from '..';
import * as bitcoin from 'bitcoinjs-lib';
import { AlkanesPayload, GatheredUtxos } from '../shared/interface';
export declare const contractDeployment: ({ payload, gatheredUtxos, account, callData, provider, feeRate, signer, }: {
    payload: AlkanesPayload;
    gatheredUtxos: GatheredUtxos;
    account: Account;
    callData: bigint[];
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    commitTx: string;
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: number;
    satsPerVByte: string;
}>;
export declare const actualDeployCommitFee: ({ payload, tweakedTaprootKeyPair, gatheredUtxos, account, provider, feeRate, signer, }: {
    payload: AlkanesPayload;
    tweakedTaprootKeyPair: bitcoin.Signer;
    gatheredUtxos: GatheredUtxos;
    account: Account;
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    fee: number;
}>;
export declare const actualDeployRevealFee: ({ callData, tweakedTaprootKeyPair, commitTxId, receiverAddress, script, provider, feeRate, }: {
    callData: bigint[];
    tweakedTaprootKeyPair: bitcoin.Signer;
    commitTxId: string;
    receiverAddress: string;
    script: Buffer;
    provider: Provider;
    signer: Signer;
    feeRate?: number;
}) => Promise<{
    fee: number;
}>;
export declare const deployReveal: ({ callData, commitTxId, script, account, provider, feeRate, signer, }: {
    callData: bigint[];
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
