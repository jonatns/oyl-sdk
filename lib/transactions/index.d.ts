import { AddressType, IBlockchainInfoUTXO } from '../shared/interface';
export declare const getBtcPrice: () => Promise<any>;
export declare const calculateBalance: (utxos: any) => number;
export declare const convertUsdValue: (amount: any) => Promise<string>;
export declare const getMetaUtxos: (address: string, utxos: IBlockchainInfoUTXO[], inscriptions: any) => Promise<any[]>;
export declare function getAddressType(address: string): AddressType | null;
export declare const validateTaprootAddress: ({ address, type }: {
    address: any;
    type: any;
}) => boolean;
export declare const validateSegwitAddress: ({ address, type }: {
    address: any;
    type: any;
}) => boolean;
export declare const decodePayload: (payload: any) => any;
