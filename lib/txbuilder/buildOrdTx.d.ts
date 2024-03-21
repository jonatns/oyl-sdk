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
export declare const getUtxosForFees: ({ payFeesWithSegwit, psbtTx, feeRate, taprootUtxos, taprootAddress, inscription, segwitUtxos, segwitAddress, segwitPubKey, utxosToSend, network, fromAddress, }: {
    payFeesWithSegwit: boolean;
    psbtTx: bitcoin.Psbt;
    feeRate: number;
    taprootUtxos: Utxo[];
    taprootAddress: string;
    inscription?: {
        isInscription: boolean;
        inscriberAddress: string;
    };
    segwitUtxos?: Utxo[];
    segwitAddress?: string;
    segwitPubKey?: string;
    utxosToSend?: {
        selectedUtxos: Utxo[];
        totalSatoshis: number;
        change: number;
    };
    network: bitcoin.Network;
    fromAddress: string;
}) => Promise<void | bitcoin.Psbt>;
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
export declare function findUtxosToCoverAmount(utxos: Utxo[], amount: number): {
    selectedUtxos: Utxo[];
    totalSatoshis: number;
    change: number;
};
export declare const usableUtxo: (feeUtxo: Utxo, utxosToSend: Utxo[]) => boolean;
