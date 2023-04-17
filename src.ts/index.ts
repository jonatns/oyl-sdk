
import requireGlobal from '../scripts'
const bcoin = requireGlobal("bcoin");
import { getAddressTx, getUnspentOutputs, calculateBalance } from './transactions';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import bip32utils from 'bip32-utils';
import Chain from './wallet/chain'
import { resolve } from 'path';




const bip32 = BIP32Factory(ecc);


const RequiredPath = [
    "m/44'/1'/0'/1", // P2PKH (Legacy)
    "m/49'/1'/0'/0", // P2SH-P2WPKH (Nested SegWit)
    "m/84'/1'/0'/0", // P2WPKH (SegWit)
    "m/86'/0'/0'/0", // P2TR (Taproot) 
]

class WalletUtils {
    private node: String;
    private network: String;
    private port: String;
    private apiKey: String;
    private nodeClient: boolean;


    public client
    public derivPath: String;


    constructor(options) {
        this.node = options.node || "bcoin";
        this.network = options.network || "mainnet";
        this.port = options.port || "port";
        this.apiKey = options.apiKey || "";
        this.nodeClient = options.nodeClient || true;
        if (this.node == "bcoin" && !this.nodeClient) {
            this.client = new bcoin.WalletClient(options);
        } else if(this.node == "bcoin" && this.nodeClient) {
            this.client = new bcoin.NodeClient(options);
        }
    }


    async getAddressSummary(address: any[]) {
        const addressesUtxo = [];
        for (let i = 0; i < address.length; i++) {
            addressesUtxo.push(address[i])
            let txs = await getAddressTx(address[i], this.client);
            let utxos = await getUnspentOutputs(txs);
            addressesUtxo[i]["utxo"] = utxos;
            addressesUtxo[i]["balance"] = calculateBalance(utxos);
        }
        return addressesUtxo;

    }


    async discoverBalance(xpub, gapLimit, enableImport = false) {
        //xpub - extended public key (see wallet.deriveXpubFromSeed())
        const childKeyB58 = bip32.fromBase58(xpub);
        
        //should manage addresses based on xpub 
        let chain = new bip32utils.Chain(childKeyB58);
        bip32utils.discovery(chain, gapLimit, async (addresses, callback) => {
            const res =  await this.getAddressSummary(addresses)
              let areUsed = res.map(function(res) {
                return res.balance > 0
              })
              callback(undefined, areUsed)
        }, function (err, used, checked) {
            if (err) throw err

            console.log('Discovered at most ' + used + ' used addresses')
            console.log('Checked ' + checked + ' addresses')
            console.log('With at least ' + (checked - used) + ' unused addresses')

            // throw away ALL unused addresses AFTER the last unused address
            let unused = checked - used
            for (let i = 1; i < unused; ++i) chain.pop()

            // remember used !== total, chain may have started at a k-index > 0
            console.log('Total number of addresses (after prune): ', chain.addresses.length)
        })
    }


    async getActiveAddresses(xpub, lookAhead = 10) {
        const childKeyB58 = bip32.fromBase58(xpub);
        const chain = new Chain(childKeyB58);
        const batch = [chain.get()] //get first at index 0
        let seenUnused =  false

        //Check through each Address to see which one has been used
        while (batch.length < lookAhead && seenUnused === false) {
            chain.next()
            batch.push(chain.get());
            const res = await this.getAddressSummary(batch)
            res.map(function(res) {
                if (res.balance > 0) {
                    seenUnused = true
                }
              })
          }
        
        return batch;
    }


    async getTotalBalance(batch){
        const res = await this.getAddressSummary(batch)
        let total = 0;
        res.forEach(element => {
           total += element.balance
        });

        return total;
    }


    async importWatchOnlyAddress (addresses: []){
        for (let i = 0; i < addresses.length; i++){
            (async () => {
               await new Promise((resolve) => setTimeout(resolve, 10000));
               await this.client.execute('importaddress', [addresses[i], "", true]); 
        })();
    }
}



    





}
