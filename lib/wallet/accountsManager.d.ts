import { oylAccounts } from '../shared/interface';
export declare class AccountManager {
    private mnemonic;
    private taprootKeyring;
    private segwitKeyring;
    activeIndexes: number[];
    taprootPath: string;
    segwitPath: string;
    constructor(options?: any);
    initializeAccounts(): Promise<oylAccounts>;
    recoverAccounts(): Promise<oylAccounts>;
    addAccount(): Promise<oylAccounts>;
}
