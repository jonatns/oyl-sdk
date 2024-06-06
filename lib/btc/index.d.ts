import { Provider } from '../provider/provider';
import * as bitcoin from 'bitcoinjs-lib';
import { Account } from '../account';
export declare const sendTx: ({ toAddress, amount, feeRate, network, account, provider, fee, }: {
    toAddress: string;
    feeRate: number;
    amount: number;
    network: bitcoin.Network;
    account: Account;
    provider: Provider;
    fee?: number;
}) => Promise<{
    estimatedFee: number;
    satsFound: number;
    psbt?: undefined;
    fee?: undefined;
} | {
    psbt: string;
    fee: number;
    estimatedFee?: undefined;
    satsFound?: undefined;
}>;
export declare const minimumFee: ({ taprootInputCount, nonTaprootInputCount, outputCount, }: {
    taprootInputCount: number;
    nonTaprootInputCount: number;
    outputCount: number;
}) => number;
