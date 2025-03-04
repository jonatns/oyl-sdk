import { Account, Provider, Signer } from '..';
import { AlkaneId, Utxo } from 'shared/interface';
export type CreateNewPoolSimulationResult = {
    lpTokens: string;
    alkaneId: AlkaneId;
};
export type FindExistingPoolIdSimulationResult = {
    alkaneId: AlkaneId;
};
export declare enum PoolFactoryOpcodes {
    INIT_POOL = 0,
    CREATE_NEW_POOL = 1,
    FIND_EXISTING_POOL_ID = 2
}
export declare const parseAlkaneIdFromHex: (hex: string) => AlkaneId;
export declare class AlkanesAMMPoolFactoryDecoder {
    decodeCreateNewPool(execution: any): CreateNewPoolSimulationResult | undefined;
    decodeFindExistingPoolId(execution: any): FindExistingPoolIdSimulationResult | undefined;
    static decodeSimulation(result: any, opcode: number): any;
}
export declare const getPoolId: () => Promise<void>;
export declare const createNewPool: (calldata: bigint[], token0: AlkaneId, token0Amount: bigint, token1: AlkaneId, token1Amount: bigint, gatheredUtxos: {
    utxos: Utxo[];
    totalAmount: number;
}, feeRate: number, account: Account, signer: Signer, provider: Provider) => Promise<{
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: number;
    satsPerVByte: string;
}>;
export declare const splitAlkaneUtxos: (tokens: {
    alkaneId: AlkaneId;
    amount: bigint;
}[], gatheredUtxos: {
    utxos: Utxo[];
    totalAmount: number;
}, feeRate: number, account: Account, signer: Signer, provider: Provider) => Promise<{
    txId: string;
    rawTx: string;
    size: any;
    weight: any;
    fee: number;
    satsPerVByte: string;
}>;
