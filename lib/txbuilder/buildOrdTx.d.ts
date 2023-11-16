import { PSBTTransaction } from './PSBTTransaction';
export declare function buildOrdTx(psbtTx: PSBTTransaction, segwitUtxos: any[], allUtxos: any[], segwitAddress: string, toAddress: string, metaOutputValue: any, inscriptionId: string): Promise<void>;
