interface AlkanesResponse {
}
interface AlkaneSimulateRequest {
    alkanes: any[];
    transaction: string;
    block: string;
    height: string;
    txindex: number;
    target: {
        block: string;
        tx: string;
    };
    inputs: string[];
    pointer: number;
    refundPointer: number;
    vout: number;
}
export declare class AlkanesRpc {
    alkanesUrl: string;
    constructor(url: string);
    _call(method: any, params?: any[]): Promise<any>;
    getAlkanesByHeight({ blockHeight, protocolTag, }: {
        blockHeight: number;
        protocolTag: string;
    }): Promise<AlkanesResponse>;
    getAlkanesByAddress({ address, protocolTag, }: {
        address: string;
        protocolTag?: string;
    }): Promise<AlkanesResponse>;
    simulate(request: AlkaneSimulateRequest): Promise<any>;
    getAlkanesByOutpoint({ txid, vout, protocolTag, }: {
        txid: string;
        vout: number;
        protocolTag?: string;
    }): Promise<any>;
}
export {};
