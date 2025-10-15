/// <reference types="node" />
/// <reference types="node" />
import { Account, Signer, Provider, AlkanesPayload } from '..';
import { AlkaneId } from '@alkanes/types';
import { FormattedUtxo, GatheredUtxos } from '../utxo';
export declare const inscribePayload: ({ alkanesUtxos, payload, utxos, account, protostone, provider, feeRate, signer, }: {
    alkanesUtxos?: FormattedUtxo[];
    payload: AlkanesPayload;
    utxos: FormattedUtxo[];
    account: Account;
    protostone: Buffer;
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    commitTx: string;
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: any;
    satsPerVByte: string;
}>;
export declare const createSendPsbt: ({ utxos, account, alkaneId, provider, toAddress, amount, feeRate, fee, }: {
    utxos: FormattedUtxo[];
    account: Account;
    alkaneId: {
        block: string;
        tx: string;
    };
    provider: Provider;
    toAddress: string;
    amount: number;
    feeRate?: number;
    fee?: number;
}) => Promise<{
    psbt: string;
}>;
export declare const send: ({ utxos, toAddress, amount, alkaneId, feeRate, account, provider, signer, }: {
    utxos: FormattedUtxo[];
    toAddress: string;
    amount: number;
    alkaneId: AlkaneId;
    feeRate?: number;
    account: Account;
    provider: Provider;
    signer: Signer;
}) => Promise<{
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: any;
    satsPerVByte: string;
}>;
export declare const actualSendFee: ({ utxos, account, alkaneId, provider, toAddress, amount, feeRate, }: {
    utxos: FormattedUtxo[];
    account: Account;
    alkaneId: {
        block: string;
        tx: string;
    };
    provider: Provider;
    toAddress: string;
    amount: number;
    feeRate: number;
}) => Promise<{
    fee: number;
    vsize: number;
}>;
export declare const split: ({ alkaneUtxos, gatheredUtxos, account, protostone, provider, feeRate, signer, }: {
    alkaneUtxos?: GatheredUtxos;
    gatheredUtxos: GatheredUtxos;
    account: Account;
    protostone: Buffer;
    provider: Provider;
    feeRate?: number;
    signer: Signer;
}) => Promise<{
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: any;
    satsPerVByte: string;
}>;
export declare const createSplitPsbt: ({ alkaneUtxos, gatheredUtxos, account, protostone, provider, feeRate, fee, }: {
    alkaneUtxos?: GatheredUtxos;
    gatheredUtxos: GatheredUtxos;
    account: Account;
    protostone: Buffer;
    provider: Provider;
    feeRate?: number;
    fee?: number;
}) => Promise<{
    psbt: string;
    psbtHex: string;
}>;
export declare const actualSplitFee: ({ gatheredUtxos, account, protostone, provider, feeRate, signer, alkaneUtxos, }: {
    gatheredUtxos: GatheredUtxos;
    account: Account;
    protostone: Buffer;
    provider: Provider;
    feeRate: number;
    signer: Signer;
    alkaneUtxos?: GatheredUtxos;
}) => Promise<{
    fee: number;
}>;
export declare const createAlkaneMultiSendPsbt: ({ sends, alkaneId, utxos, account, provider, feeRate, fee, }: {
    sends: {
        address: string;
        amount: number;
    }[];
    alkaneId: AlkaneId;
    utxos: FormattedUtxo[];
    account: Account;
    provider: Provider;
    feeRate?: number;
    fee?: number;
}) => Promise<{
    psbt: string;
    psbtHex: string;
}>;
export declare const actualAlkaneMultiSendFee: ({ sends, alkaneId, utxos, account, provider, feeRate, }: {
    sends: {
        address: string;
        amount: number;
    }[];
    alkaneId: AlkaneId;
    utxos: FormattedUtxo[];
    account: Account;
    provider: Provider;
    feeRate: number;
}) => Promise<{
    fee: number;
    vsize: number;
}>;
export declare const alkaneMultiSend: ({ sends, alkaneId, utxos, account, provider, signer, feeRate, }: {
    sends: {
        address: string;
        amount: number;
    }[];
    alkaneId: AlkaneId;
    utxos: FormattedUtxo[];
    account: Account;
    provider: Provider;
    signer: Signer;
    feeRate?: number;
}) => Promise<{
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: any;
    satsPerVByte: string;
}>;
