import { IBlockchainInfoUTXO } from "../shared/interface";
import { OylApiClient } from '../apiclient';
import { SandshrewBitcoinClient } from '../rpclient/sandshrew';
import { EsploraRpc } from "../rpclient/esplora";
export declare class BuildMarketplaceTransaction {
    walletAddress: string;
    pubKey: string;
    apiClient: OylApiClient;
    esploraRpc: EsploraRpc;
    feeRate: number;
    psbtBase64: string;
    orderPrice: number;
    sandshrewBtcClient: SandshrewBitcoinClient;
    makersAddress: string | null;
    constructor({ address, pubKey, feeRate, psbtBase64, price }: {
        address: string;
        pubKey: string;
        feeRate: number;
        psbtBase64: string;
        price: number;
    });
    getUTXOsToCoverAmount(amountNeeded: number, inscriptionLocs?: string[]): Promise<IBlockchainInfoUTXO[]>;
    psbtBuilder(): Promise<void>;
    getAllUTXOsWorthASpecificValue(value: number): Promise<IBlockchainInfoUTXO[]>;
    calculateAmountGathered(utxoArray: IBlockchainInfoUTXO[]): number;
    getUnspentsWithConfirmationsForAddress(): Promise<IBlockchainInfoUTXO[]>;
    getUnspentsForAddressInOrderByValue(): Promise<IBlockchainInfoUTXO[]>;
    getMakersAddress(): Promise<void>;
}
