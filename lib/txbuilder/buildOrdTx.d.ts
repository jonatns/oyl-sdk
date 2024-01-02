import * as bitcoin from 'bitcoinjs-lib';
export type Utxo = {
    txId: string;
    outputIndex: number;
    satoshis: number;
    scriptPk: string;
    addressType: number;
    address: string;
    inscriptions: any[];
    confirmations: number;
};
export declare const getUtxosForFees: ({ payFeesWithSegwit, psbtTx, feeRate, taprootUtxos, taprootAddress, segwitUtxos, segwitAddress, segwitPubKey, utxosToSend, network }: {
    payFeesWithSegwit: boolean;
    psbtTx: bitcoin.Psbt;
    feeRate: number;
    taprootUtxos: Utxo[];
    taprootAddress: string;
    segwitUtxos?: Utxo[];
    segwitAddress?: string;
    segwitPubKey?: string;
    utxosToSend?: Utxo[];
    network: bitcoin.Network;
}) => Promise<void>;
export declare const addInscriptionUtxo: ({ metaUtxos, inscriptionId, toAddress, psbtTx, }: {
    metaUtxos: any[];
    inscriptionId: string;
    toAddress: string;
    psbtTx: bitcoin.Psbt | any;
}) => Promise<any>;
export declare function findUtxosForFees(utxos: Utxo[], amount: number): {
    selectedUtxos: Utxo[];
    totalSatoshis: number;
    change: number;
};
