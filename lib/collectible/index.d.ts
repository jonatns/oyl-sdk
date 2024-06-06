import { Provider } from '../provider/provider';
import { Account } from '../account';
export declare const sendTx: ({ account, inscriptionId, provider, toAddress, feeRate, fee, }: {
    account: Account;
    inscriptionId: string;
    provider: Provider;
    toAddress: string;
    feeRate?: number;
    fee?: number;
}) => Promise<{
    estimatedFee: number;
    satsFound: number;
    psbt?: undefined;
} | {
    psbt: string;
    estimatedFee?: undefined;
    satsFound?: undefined;
}>;
