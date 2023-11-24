import { PSBTTransaction } from './PSBTTransaction';
export declare function buildOrdTx({ psbtTx, allUtxos, toAddress, metaOutputValue, feeRate, inscriptionId, taprootAddress, payFeesWithSegwit, segwitAddress, segwitUtxos, }: {
    psbtTx: PSBTTransaction;
    allUtxos: any[];
    toAddress: string;
    metaOutputValue: any;
    feeRate: number;
    inscriptionId: string;
    taprootAddress: string;
    payFeesWithSegwit: boolean;
    segwitAddress?: string;
    segwitUtxos?: any[];
}): Promise<import("bitcoinjs-lib").Psbt>;
