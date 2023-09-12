interface Result {
    statusCode: number;
    data: any;
}
export declare class Unisat {
    private marketUrl;
    private marketApi;
    private brcApiv3;
    private brcApiv2;
    private api;
    private id;
    address: string;
    constructor(options?: any);
    getProps(): {
        address: string;
        id: string;
    };
    _call(path: any, method: any, data?: any, extraHeaders?: {}): Promise<Result>;
    getTickerHtml({ tick, tab }: {
        tick?: string;
        tab?: string;
    }): Promise<Result>;
    getUtxo({ address }: {
        address: string;
    }): Promise<any>;
    _init(): Promise<Result>;
    flowCheck({ address }: {
        address: string;
    }): Promise<{
        instruction: string;
        inscribing: any;
        orderid: any;
    }>;
    addressBalance({ address }: {
        address: string;
    }): Promise<any>;
    addressBrcToken({ address }: {
        address: string;
    }): Promise<any>;
    brcTokenSummary({ address, ticker }: {
        address: string;
        ticker: string;
    }): Promise<any>;
    getBrcTypes(): Promise<any>;
    getBrcInfo({ ticker }: {
        ticker: string;
    }): Promise<any>;
    getBrcHolders({ ticker }: {
        ticker: string;
    }): Promise<any>;
    mintBrcToken({ ticker, feeRate, address, amount }: {
        ticker: string;
        feeRate: number;
        address: string;
        amount: string;
    }): Promise<any>;
    getInscribePayslip({ orderid }: {
        orderid: string;
    }): Promise<any>;
    getBrcConfig(): Promise<Result>;
    getInscriptionUtxo({ ordid }: {
        ordid: string;
    }): Promise<any>;
    getBrcListings({ tick }: {
        tick: any;
    }): Promise<Result>;
}
export {};
