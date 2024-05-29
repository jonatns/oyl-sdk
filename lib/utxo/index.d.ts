import { Provider } from '../provider/provider';
import { Utxo } from '../txbuilder';
import { Account } from '../account';
export declare const spendableUtxos: (address: string, provider: Provider) => Promise<Utxo[]>;
export declare const oylSpendableUtxos: ({ accounts, provider, spendAmount, }: {
    accounts: Account;
    provider: Provider;
    spendAmount: number;
}) => Promise<Utxo[]>;
export declare function findUtxosToCoverAmount(utxos: any[], amount: number): {
    selectedUtxos: any[];
    totalSatoshis: number;
    change: number;
};
