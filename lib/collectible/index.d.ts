import { Provider } from '../provider/provider';
import { Account } from '../account';
export declare const send: ({ account, inscriptionId, provider, toAddress, feeRate, fee, }: {
    account: Account;
    inscriptionId: string;
    provider: Provider;
    toAddress: string;
    feeRate?: number;
    fee?: number;
}) => Promise<{
    psbt: string;
}>;
export declare const findCollectible: ({ address, provider, inscriptionId, }: {
    address: string;
    provider: Provider;
    inscriptionId: string;
}) => Promise<{
    txId: string;
    voutIndex: string;
    data: any;
}>;
