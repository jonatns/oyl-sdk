import { Provider } from '../provider/provider';
import { Account, SpendStrategy } from '../account';
export interface EsploraUtxo {
    txid: string;
    vout: number;
    status: {
        confirmed: boolean;
        block_height: number;
        block_hash: string;
        block_time: number;
    };
    value: number;
}
export interface FormattedUtxo {
    txId: string;
    outputIndex: number;
    satoshis: number;
    scriptPk: string;
    address: string;
    inscriptions: any[];
    confirmations: number;
}
export declare const accountSpendableUtxos: ({ account, provider, spendAmount, }: {
    account: Account;
    provider: Provider;
    spendAmount: number;
}) => Promise<FormattedUtxo[]>;
export declare const addressSpendableUtxos: ({ address, provider, spendAmount, spendStrategy }: {
    address: string;
    provider: Provider;
    spendAmount?: number;
    spendStrategy?: SpendStrategy;
}) => Promise<{
    totalGathered: number;
    utxos: FormattedUtxo[];
}>;
export declare function findUtxosToCoverAmount(utxos: FormattedUtxo[], amount: number): {
    selectedUtxos: any[];
    totalSatoshis: number;
    change: number;
};
