import * as bitcoin from 'bitcoinjs-lib';
import Mnemonic from 'bitcore-mnemonic';
interface SingleAccount {
    [addressKeyValue: string]: {
        pubkey: string;
        addressType: string;
        btcAddress: string;
    };
}
interface AllAccounts {
    segwit: SingleAccount;
    taproot: SingleAccount;
    nestedSegwit: SingleAccount;
    legacy: SingleAccount;
}
export declare class Account {
    mnemonicObject: Mnemonic;
    constructor(mnemonic: string);
    mnemonicToAccount(network: bitcoin.Network, hdPath: string): {
        pubkey: string;
        addressType: "p2pkh" | "p2tr" | "p2wpkh" | "p2sh-p2wpkh";
        btcAddress: string;
    };
    allAddresses(network: bitcoin.Network): AllAccounts;
}
export {};
