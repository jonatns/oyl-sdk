import { Provider } from '../provider/provider';
import * as bitcoin from 'bitcoinjs-lib';
import { Account } from '../account';
export declare const constructPsbt: ({ toAddress, feeRate, amount, account, provider, fee, }: {
    toAddress: string;
    feeRate?: number;
    amount: number;
    account: Account;
    provider: Provider;
    fee: number;
}) => Promise<string>;
export declare const createTx: ({ toAddress, amount, feeRate, network, account, provider, fee, }: {
    toAddress: string;
    feeRate: number;
    amount: number;
    network: bitcoin.Network;
    account: Account;
    provider: Provider;
    fee?: number;
}) => Promise<{
    psbt: string;
    fee: number;
}>;
export declare const minimumFee: ({ taprootInputCount, nonTaprootInputCount, outputCount, }: {
    taprootInputCount: number;
    nonTaprootInputCount: number;
    outputCount: number;
}) => number;
