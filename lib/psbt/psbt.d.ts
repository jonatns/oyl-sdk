import { Provider } from '../provider';
type BasePsbtParams = {
    feeRate?: number;
    provider: Provider;
    fee?: number;
};
type PsbtBuilderFunction<T extends BasePsbtParams> = (params: T) => Promise<{
    psbt: string;
    fee?: number;
}>;
export declare const psbtBuilder: <T extends BasePsbtParams>(psbtBuilder: PsbtBuilderFunction<T>, params: T) => Promise<{
    psbt: string;
    fee: number;
    vsize: number;
}>;
export declare const getEstimatedFee: ({ feeRate, psbt, provider, }: {
    feeRate: number;
    psbt: string;
    provider: Provider;
}) => Promise<{
    fee: number;
    vsize: number;
}>;
export {};
