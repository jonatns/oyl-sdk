
import requireGlobal from '../scripts'
const bcoin = requireGlobal("bcoin");
import { getAddressTx, getUnspentOutputs, calculateBalance } from './transactions';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import bip32utils from 'bip32-utils';




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


    async getAddressSummary(address: []) {
        const addressesUtxo = [];

        for (let i = 0; i < address.length; i++) {
            addressesUtxo.push(address[i])
            let txs = await getAddressTx(address[i], this.client);
            let utxos = await getUnspentOutputs(txs);
            addressesUtxo[i]["utxo"] = utxos;
            addressesUtxo[i]["totalBalance"] = calculateBalance(utxos);
        }

        return addressesUtxo;

    }


    async discoverAccounts(xpub, gapLimit, coinType?) {
        const childKeyB58 = bip32.fromBase58(xpub);
        let chain = new bip32utils.Chain(childKeyB58);
        console.log(chain);
        bip32utils.discovery(chain, gapLimit, function (addresses, callback) {
            const res =  this.getAddressSummary(addresses)
              let areUsed = res.map(function(res) {
                return res.totalReceived > 0
              })
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





}
