import { oylAccounts } from '../shared/interface';
export declare class AccountManager {
    private mnemonic;
    private taprootKeyring;
    private segwitKeyring;
    activeIndexes: number[];
    private hdPath;
    /**
     * Initializes a new AccountManager instance with the given options.
     *
     * @param options - Configuration options for the AccountManager.
     */
    constructor(options?: any);
    /**
     * Initializes taproot and segwit accounts by generating the necessary addresses.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the initialized accounts.
     */
    initializeAccounts(): Promise<oylAccounts>;
    /**
     * Recovers existing accounts by fetching and converting the public keys to addresses.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the recovered accounts.
     */
    recoverAccounts(): Promise<oylAccounts>;
    /**
     * Adds a new account for both taproot and segwit and returns the updated account information.
     *
     * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the updated accounts.
     */
    addAccount(): Promise<oylAccounts>;
}
