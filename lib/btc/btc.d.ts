import { Provider } from '../provider/provider';
import { Account } from '../account/account';
import { Signer } from '../signer';
import { FormattedUtxo } from '../utxo';
import { AlkanesPayload } from 'shared/interface';
export declare const createPsbt: ({ utxos, toAddress, amount, feeRate, account, provider, fee, }: {
    utxos: FormattedUtxo[];
    toAddress: string;
    feeRate: number;
    amount: number;
    account: Account;
    provider: Provider;
    fee?: number;
}) => Promise<{
    psbt: string;
    fee: number;
}>;
export declare const send: ({ utxos, toAddress, amount, feeRate, account, provider, signer, fee, }: {
    utxos: FormattedUtxo[];
    toAddress: string;
    amount: number;
    feeRate: number;
    account: Account;
    provider: Provider;
    signer: Signer;
    fee?: number;
}) => Promise<{
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: any;
    satsPerVByte: string;
}>;
export declare const actualFee: ({ utxos, toAddress, amount, feeRate, account, provider, signer, }: {
    utxos: FormattedUtxo[];
    toAddress: string;
    feeRate: number;
    amount: number;
    account: Account;
    provider: Provider;
    signer: Signer;
}) => Promise<{
    fee: number;
}>;
export declare const minimumFee: ({ taprootInputCount, nonTaprootInputCount, outputCount, payload, }: {
    taprootInputCount: number;
    nonTaprootInputCount: number;
    outputCount: number;
    payload?: AlkanesPayload;
}) => number;
