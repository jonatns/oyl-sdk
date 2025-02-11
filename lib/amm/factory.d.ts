import { Account, Provider, Signer } from 'index';
import { AlkaneId, Utxo } from 'shared/interface';
export declare const getPoolId: () => Promise<void>;
export declare const createNewPool: (calldata: bigint[], token0: AlkaneId, token0Amount: bigint, token1: AlkaneId, token1Amount: bigint, gatheredUtxos: {
    utxos: Utxo[];
    totalAmount: number;
}, feeRate: number, account: Account, signer: Signer, provider: Provider) => Promise<void>;
