import * as bitcoin from 'bitcoinjs-lib';
import { PSBTTransaction } from './PSBTTransaction';
export type Utxo = {
    txId: string;
    outputIndex: number;
    satoshis: number;
    scriptPk: string;
    addressType: number;
    address: string;
    inscriptions: any[];
};
export declare function buildOrdTx({ psbtTx, allUtxos, toAddress, metaOutputValue, feeRate, inscriptionId, taprootAddress, payFeesWithSegwit, segwitAddress, segwitUtxos, segwitPubKey, }: {
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
    segwitPubKey?: string;
}): Promise<any>;
export declare const getUtxosForFees: ({ payFeesWithSegwit, psbtTx, feeRate, taprootUtxos, taprootAddress, segwitUtxos, segwitAddress, segwitPubKey, }: {
    payFeesWithSegwit: boolean;
    psbtTx: PSBTTransaction | bitcoin.Psbt;
    feeRate: number;
    taprootUtxos: Utxo[];
    taprootAddress: string;
    segwitUtxos?: Utxo[];
    segwitAddress?: string;
    segwitPubKey?: string;
}) => Promise<void>;
