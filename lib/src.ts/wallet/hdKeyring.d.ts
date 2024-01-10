/// <reference types="node" />
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairInterface } from 'ecpair';
import bitcore from 'bitcore-lib';
import { EventEmitter } from 'events';
import Mnemonic from 'bitcore-mnemonic';
export interface HDKeyringOption {
    hdPath?: string;
    mnemonic?: any;
    activeIndexes?: number[];
    passphrase?: string;
    network: bitcoin.Network;
}
export declare class HdKeyring extends EventEmitter {
    mnemonic: any;
    passphrase: string;
    network: bitcoin.Network;
    hdPath: string;
    root: bitcore.HDPrivateKey;
    hdWallet?: Mnemonic;
    wallets: ECPairInterface[];
    private _index2wallet;
    activeIndexes: number[];
    /**
     * Initializes a new instance of the HdKeyring class.
     * @param {HDKeyringOption} opts - HD Keyring options.
     */
    constructor(opts?: HDKeyringOption);
    /**
     * Serializes the HDKeyring instance to a JSON object.
     * @returns {Promise<HDKeyringOption>} A promise that resolves to an object with the HDKeyring properties.
     */
    serialize(): Promise<HDKeyringOption>;
    /**
     * Deserializes options to a HDKeyring instance.
     * @param {HDKeyringOption} _opts - The HDKeyring options object.
     * @returns {HdKeyring} The instance of the HDKeyring.
     */
    deserialize(_opts: HDKeyringOption): HdKeyring;
    /**
     * Initializes the HD keyring from a mnemonic phrase.
     * @param {string} mnemonic - The mnemonic phrase to use for initialization.
     */
    initFromMnemonic(mnemonic: string, network: bitcoin.Network): void;
    /**
     * Changes the HD path used by the keyring and reinitializes accounts.
     * @param {string} hdPath - The new HD path to be used.
     */
    changeHdPath(hdPath: string, network: bitcoin.Network): void;
    /**
     * Retrieves an account's address by its HD path and index.
     * @param {string} hdPath - The HD path to derive the account from.
     * @param {number} index - The index of the account.
     * @returns {string} The account address as a string.
     */
    getAccountByHdPath(hdPath: string, index: number, network: bitcoin.Network): string;
    /**
     * Adds a specified number of new accounts to the keyring.
     * @param {number} numberOfAccounts - The number of new accounts to add. Defaults to 1 if not specified.
     * @returns {Promise<string[]>} A promise that resolves to an array of new account addresses in hex format.
     */
    addAccounts(numberOfAccounts: number, network: bitcoin.Network): Promise<string[]>;
    /**
     * Activates a list of accounts by their indexes.
     * @param {number[]} indexes - An array of account indexes to activate.
     * @returns An array of activated account addresses in hex format.
     */
    activeAccounts(indexes: number[]): string[];
    /**
     * Retrieves a list of addresses within a specified index range.
     * @param {number} start - The start index of the range.
     * @param {number} end - The end index of the range.
     * @returns {{ address: string; index: number }[]} An array of objects with address and index properties.
     */
    getAddresses(start: number, end: number): {
        address: string;
        index: number;
    }[];
    /**
     * Gets the hex string representations of public keys for all accounts.
     * @returns {string[]} An array of account addresses in hex format.
     */
    getAccounts(): string[];
    /**
     * Retrieves the private key for the given public key.
     * @param {string} publicKey - The public key to retrieve the private key for.
     * @returns {ECPairInterface} The corresponding private key.
     * @private
     */
    private _getPrivateKeyFor;
    /**
     * Retrieves the wallet for a given account's public key.
     * @param {string} publicKey - The public key of the account to retrieve the wallet for.
     * @returns {ECPairInterface} The wallet corresponding to the given public key.
     * @private
     */
    private _getWalletForAccount;
    /**
     * Signs a PSBT (Partially Signed Bitcoin Transaction) using the private keys managed by this keyring.
     * @param {bitcoin.Psbt} psbt - The PSBT to sign.
     * @param {{ index: number; publicKey: string; sighashTypes?: number[] }[]} inputs - The inputs to sign, with their index, public key, and optional sighash types.
     * @param opts - Additional options.
     * @returns {Promise<bitcoin.Psbt>} A promise that resolves to the signed PSBT.
     */
    signTransaction(psbt: bitcoin.Psbt, inputs: {
        index: number;
        publicKey: string;
        sighashTypes?: number[];
    }[], opts?: any): Promise<bitcoin.Psbt>;
    /**
     * Retrieves the address and corresponding ECPair object from a given index.
     * @param {number} i - The index to derive the address from.
     * @returns {[string, ECPairInterface]} A tuple containing the address and the ECPair object.
     */
    private _addressFromIndex;
}
