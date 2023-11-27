import * as bitcoin from 'bitcoinjs-lib';
import { PSBTTransaction } from './PSBTTransaction';
export declare function buildOrdTx({ psbtTx, allUtxos, toAddress, metaOutputValue, feeRate, inscriptionId, taprootAddress, payFeesWithSegwit, segwitAddress, segwitUtxos, }: {
    psbtTx: PSBTTransaction | bitcoin.Psbt | any;
    allUtxos: any[];
    toAddress: string;
    metaOutputValue?: any;
    feeRate: number;
    inscriptionId?: string;
    taprootAddress: string;
    payFeesWithSegwit: boolean;
    segwitAddress?: string;
    segwitUtxos?: any[];
}): Promise<any>;
export declare const getUtxosForFees: ({ payFeesWithSegwit, psbtTx, feeRate, taprootUtxos, taprootAddress, segwitUtxos, segwitAddress, }: {
    payFeesWithSegwit: boolean;
    psbtTx: PSBTTransaction | bitcoin.Psbt;
    feeRate: number;
    taprootUtxos: any[];
    taprootAddress: string;
    segwitUtxos?: any[];
    segwitAddress?: string;
}) => Promise<void>;
