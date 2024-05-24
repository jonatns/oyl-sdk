import * as bitcoin from 'bitcoinjs-lib';
import { AddressType } from '../shared/interface';
import { Provider } from '../provider/provider';
export declare class Account {
    mnemonic: string;
    network: bitcoin.Network;
    index?: number;
    provider: Provider;
    constructor({ mnemonic, network, index, provider, }: {
        mnemonic: string;
        network: bitcoin.Network;
        index?: number;
        provider: Provider;
    });
    hdPathToAddressType: ({ hdPath }: {
        hdPath: string;
    }) => AddressType;
    mnemonicToAccount({ hdPath }: {
        hdPath: string;
    }): {
        pubkey: string;
        addressType: "p2pkh" | "p2tr" | "p2wpkh" | "p2sh-p2wpkh";
        address: string;
        privateKey: string;
    };
    addresses(): {
        taproot: {
            pubkey: string;
            pubKeyXOnly: string;
            privateKey: string;
            address: string;
        };
        nativeSegwit: {
            pubkey: string;
            privateKey: string;
            address: string;
        };
        nestedSegwit: {
            pubkey: string;
            privateKey: string;
            address: string;
        };
        legacy: {
            pubkey: string;
            privateKey: string;
            address: string;
        };
    };
    spendableUtxos({ address }: {
        address: string;
    }): Promise<any>;
}
