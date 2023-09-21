import { PSBTTransaction } from './txbuilder/PSBTTransaction'
import { UTXO_DUST } from "./shared/constants"
import { amountToSatoshis, satoshisToAmount } from './shared/utils'
import NodeClient from './rpclient';
import *  as transactions from './transactions';
import { publicKeyToAddress } from './wallet/accounts'
import { bord, accounts } from './wallet'
import { AddressType, SwapBrc, SignedBid } from './shared/interface';
import { OylApiClient } from "./apiclient"
import * as bitcoin from 'bitcoinjs-lib'
import { swapFlow } from './cli';


const RequiredPath = [
  "m/44'/0'/0'/0", // P2PKH (Legacy)
  "m/49'/0'/0'/0", // P2SH-P2WPKH (Nested SegWit)
  "m/84'/0'/0'/0", // P2WPKH (SegWit)
  "m/86'/0'/0'/0", // P2TR (Taproot)
]

export class Wallet {
  private node: String
  private network: String
  private port: Number
  private apiKey: String
  private host: String
  private nodeClient: boolean

  public rpcClient: NodeClient
  public apiClient: OylApiClient
  public derivPath: String

  /***
   * TO-DO
   * Replace NodeCLient with ApiClient so all requests to the node gets routed
   * through Oyl's api server
   */
  constructor(options?) {
    try {
      this.node = options?.node || 'bcoin'
      this.network = options?.network || 'main'
      this.port = options?.port || 8332
      this.host = options?.host || '198.199.72.193'
      this.apiKey = options?.apiKey || 'bikeshed'
      this.nodeClient = options?.nodeClient || true
      if (this.node == 'bcoin' && !this.nodeClient) {
        //TODO Implement WalletClient in rpclient
        console.log('rpc client inactive')
        return
      } else if (this.node == 'bcoin' && this.nodeClient) {
        const clientOptions = {
          network: this.network,
          port: this.port,
          host: this.host,
          apiKey: this.apiKey,
        }
        this.rpcClient = new NodeClient(clientOptions)
      }
      this.apiClient = new OylApiClient({ host: 'https://api.oyl.gg'});
    } catch (e) {
      console.log('An error occured: ', e)
    }
  }

  static fromObject(data) {
    const result = new this(data)
    return result
  }

  toObject() {
    return {
      network: this.network,
      port: this.port,
      host: this.host,
      apiKey: this.apiKey,
    }
  }

  async getAddressSummary({ address }) {
    if (typeof address === 'string') {
      address = [address]
    }
    const addressesUtxo = [];
    for (let i = 0; i < address.length; i++) {
      let utxos = await transactions.getUnspentOutputs(address[i])
      //console.log(utxos)
      addressesUtxo[i] = {}
      addressesUtxo[i]['utxo'] = utxos.unspent_outputs
      addressesUtxo[i]['balance'] = transactions.calculateBalance(
        utxos.unspent_outputs
      )
    }
    return addressesUtxo
  }

  // async discoverBalance({ xpub, gapLimit, enableImport = false }) {
  //   //xpub - extended public key (see wallet.deriveXpubFromSeed())
  //   const childKeyB58 = bip32.fromBase58(xpub)

  //   //should manage addresses based on xpub
  //   //should get change Addresses as well to identify inscriptions
  //   let chain = new bip32utils.Chain(childKeyB58)
  //   bip32utils.discovery(
  //     chain,
  //     gapLimit,
  //     async (addresses, callback) => {
  //       const res = await this.getAddressSummary(addresses)
  //       let areUsed = res.map(function (res) {
  //         return res.balance > 0
  //       })
  //       callback(undefined, areUsed)
  //     },
  //     function (err, used, checked) {
  //       if (err) throw err

  //       console.log('Discovered at most ' + used + ' used addresses')
  //       console.log('Checked ' + checked + ' addresses')
  //       console.log('With at least ' + (checked - used) + ' unused addresses')

  //       // throw away ALL unused addresses AFTER the last unused address
  //       let unused = checked - used
  //       for (let i = 1; i < unused; ++i) chain.pop()

  //       // remember used !== total, chain may have started at a k-index > 0
  //       console.log(
  //         'Total number of addresses (after prune): ',
  //         chain.addresses.length
  //       )
  //     }
  //   )
  // }

  async getTaprootAddress({ publicKey }) {
    try {
      const address = publicKeyToAddress(publicKey, AddressType.P2TR)
      return address;
    } catch (err) {
      return err;
    }
  }

  async importWallet({ mnemonic, hdPath = RequiredPath[3], type = 'taproot' }) {
    try {
      let addrType

      switch (type) {
        case 'taproot':
          addrType = AddressType.P2TR
          break
        case 'segwit':
          addrType = AddressType.P2WPKH
          break
        case 'legacy':
          addrType = AddressType.P2PKH
          break
        default:
          addrType = AddressType.P2TR
          break
      }

      const wallet = await accounts.importMnemonic(mnemonic, hdPath, addrType)
      const meta = await this.getUtxosArtifacts({ address: wallet['address'] })
      const data = {
        keyring: wallet,
        assets: meta,
      }
      return data
    } catch (err) {
      return err
    }
  }

  // async importMeta({ mnemonic }) {
  //   try {
  //     const unisat = {
  //       hdPath: "m/86'/0'/0'/0",
  //       type: 'taproot',
  //     }
  //     const oylLib = {
  //       hdPath: "m/49'/0'/0'",
  //       type: 'segwit',
  //     }

  //     const payloadA = await this.importWallet({
  //       mnemonic: mnemonic,
  //       hdPath: unisat.hdPath,
  //       type: unisat.type,
  //     })
  //     const payloadB = await this.importWallet({
  //       mnemonic: mnemonic,
  //       hdPath: oylLib.hdPath,
  //       type: oylLib.type,
  //     })

  //     const data = {
  //       unisatAddress: payloadA['keyring']['address'],
  //       unisatAssets: payloadA['assets'],
  //       oylLibAddress: payloadB['keyring']['address'],
  //       oylLibAssets: payloadB['assets'],
  //     }


  //     return data
  //   } catch (e) {
  //     return e
  //   }
  // }

  async getSegwitAddress({ publicKey }) {
    const address = publicKeyToAddress(publicKey, AddressType.P2WPKH);
    return address;
  }

  async createWallet({ type }) {
    try {
      let hdPath
      let addrType

      switch (type) {
        case 'taproot':
          addrType = AddressType.P2TR
          hdPath = RequiredPath[3]
          break
        case 'segwit':
          addrType = AddressType.P2WPKH
          hdPath = RequiredPath[2]
          break
        case 'nested-segwit':
          addrType = AddressType.P2SH_P2WPKH
          hdPath = RequiredPath[1]
        case 'legacy':
          addrType = AddressType.P2PKH
          hdPath = RequiredPath[0]
          break
        default:
          addrType = AddressType.P2TR
          hdPath = RequiredPath[3]
          break
      }

      const wallet = await accounts.createWallet(hdPath, addrType)
      return wallet
    } catch (err) {
      return err;
    }
  }

  async getMetaBalance({ address }) {
    const addressSummary = await this.getAddressSummary({ address })
    const confirmAmount = addressSummary.reduce((total, addr) => {
      const confirmedUtxos = addr.utxo.filter((utxo) => utxo.confirmations > 0)
      return (
        total + confirmedUtxos.reduce((sum, utxo) => sum + utxo.value / 1e8, 0)
      )
    }, 0)

    const pendingAmount = addressSummary.reduce((total, addr) => {
      const unconfirmedUtxos = addr.utxo.filter(
        (utxo) => utxo.confirmations === 0
      )
      return (
        total +
        unconfirmedUtxos.reduce((sum, utxo) => sum + utxo.value / 1e8, 0)
      )
    }, 0)

    const amount = confirmAmount + pendingAmount

    const usdValue = await transactions.convertUsdValue(amount)

    const response = {
      confirm_amount: confirmAmount.toFixed(8),
      pending_amount: pendingAmount.toFixed(8),
      amount: amount.toFixed(8),
      usd_value: usdValue,
    }

    return response
  }

  async getTxHistory({ address }) {
    const history = await this.rpcClient.getTxByAddress(address)
    const processedTransactions = history
      .map((tx) => {
        const { hash, mtime, outputs, inputs, confirmations } = tx

        const output = outputs.find((output) => output.address === address)
        const input = inputs.find((input) => input.coin.address === address)
        const txDetails = {};
        txDetails["hash"] = hash;
        txDetails["confirmations"] = confirmations;
        if (input) {
          txDetails["type"] = "sent";
          txDetails["to"] = outputs.find((output) => output.address != address)?.address
          if (output) {
            txDetails["amount"] = (input.coin.value / 1e8) - (output.value / 1e8)
          } else {
            txDetails["amount"] = input.coin.value / 1e8
          }
        } else {
          if (output) {
            txDetails["type"] = "received";
            txDetails["amount"] = output.value / 1e8
            txDetails["from"] = inputs.find((input) => input.coin.address != address).coin.address
          }
        }
        txDetails["symbol"] = 'BTC'
        return txDetails;
      })
      .filter((transaction) => transaction !== null) // Filter out null transactions

    return processedTransactions
  }

  private async calculateHighPriorityFee(payload: { [key: string]: object }) {
    const fees = Object.values(payload).map((transaction) => transaction['fee'])
    fees.sort((a, b) => a - b)
    const medianFee = fees[Math.floor(fees.length / 2)]
    return medianFee * 2
  }

  async getFees() {
    const rawMempool = await this.rpcClient.execute(
      'getrawmempool',
      [true] /* verbose */
    )
    const mempoolInfo = await this.rpcClient.execute('getmempoolinfo')
    const high = (await this.calculateHighPriorityFee(rawMempool)) * 100000000 // 10 mins
    const low = mempoolInfo.mempoolminfee * 2 * 100000000
    const medium = (high + low) / 2
    return {
      high,
      medium,
      low,
    }
  }

  // async getActiveAddresses({ xpub, lookAhead = 10 }) {
  //   const childKeyB58 = bip32.fromBase58(xpub)
  //   const chain = new Chain(childKeyB58)
  //   const batch = [chain.get()] //get first at index 0
  //   let seenUnused = false

  //   //Check through each Address to see which one has been used
  //   while (batch.length < lookAhead && seenUnused === false) {
  //     chain.next()
  //     batch.push(chain.get())
  //     const res = await this.getAddressSummary({ address: batch })
  //     res.map(function (res) {
  //       if (res.balance > 0) {
  //         seenUnused = true
  //       }
  //     })
  //   }

  //   return batch
  // }

  async getTotalBalance({ batch }) {
    const res = await this.getAddressSummary({ address: batch })
    let total = 0
    res.forEach((element) => {
      total += element.balance
    })

    return total
  }

  async getInscriptions({ address }) {
    const artifacts = await bord.getInscriptionsByAddr(address)
    return artifacts.map((item) => {
      const {
        id,
        inscription_number: num,
        inscription_number: number,
        content_length,
        content_type,
        timestamp,
        genesis_transaction,
        location,
        output,
        output_value,
      } = item

      const detail = {
        id,
        address: item.address,
        output_value: parseInt(output_value),
        preview: `https://ordinals.com/preview/${id}`,
        content: `https://ordinals.com/content/${id}`,
        content_length: parseInt(content_length),
        content_type,
        timestamp,
        genesis_transaction,
        location,
        output,
        offset: parseInt(item.offset),
        content_body: '',
      }

      return {
        id,
        num,
        number,
        detail,
      }
    })
  }

  async getUtxosArtifacts({ address }) {
    const utxos = await transactions.getUnspentOutputs(address)
    const inscriptions = await this.getInscriptions({ address })
    const utxoArtifacts = await transactions.getMetaUtxos(
      address,
      utxos.unspent_outputs,
      inscriptions
    )
    return utxoArtifacts
  }

  async importWatchOnlyAddress({ addresses = [] }) {
    for (let i = 0; i < addresses.length; i++) {
      (async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000))
        await this.rpcClient.execute('importaddress', [addresses[i], '', true])
      })()
    }
  }

  // async sendBtc({ mnemonic, to, amount, fee }) {

  //   const payload = await this.importWallet({
  //     mnemonic: mnemonic.trim(),
  //     hdPath: "m/49'/0'/0'",
  //     type: 'segwit',
  //   })
  //   const keyring = payload.keyring.keyring;
  //   const pubKey = keyring.wallets[0].publicKey.toString('hex');
  //   const signer = keyring.signTransaction.bind(keyring);
  //   const from = payload.keyring.address;
  //   const changeAddress = from;


  //   return await this.createPsbtTx({publicKey: pubKey, from: from, to: to, changeAddress: changeAddress, amount: amount, fee: fee,  signer: signer })
  //   }


  
  


  async createPsbtTx({ publicKey, from, to, changeAddress, amount, fee, signer }) {
    const utxos = await this.getUtxosArtifacts({ address: from });
    const feeRate = fee / 100;
    const addressType = transactions.getAddressType(from)
    if (addressType != null) throw Error("Invalid Address Type");

    const tx = new PSBTTransaction(
      signer,
      from,
      publicKey,
      addressType,
      feeRate
    );

    tx.addOutput(to, amountToSatoshis(amount));
    tx.setChangeAddress(changeAddress);
    const outputAmount = tx.getTotalOutput();

    const nonOrdUtxos = [];
    const ordUtxos = [];
    utxos.forEach((v) => {
      if (v.inscriptions.length > 0) {
        ordUtxos.push(v);
      } else {
        nonOrdUtxos.push(v);
      }
    });

    let tmpSum = tx.getTotalInput();
    for (let i = 0; i < nonOrdUtxos.length; i++) {
      const nonOrdUtxo = nonOrdUtxos[i];
      if (tmpSum < outputAmount) {
        tx.addInput(nonOrdUtxo);
        tmpSum += nonOrdUtxo.satoshis;
        continue;
      }

      const fee = await tx.calNetworkFee();
      if (tmpSum < outputAmount + fee) {
        tx.addInput(nonOrdUtxo);
        tmpSum += nonOrdUtxo.satoshis;
      } else {
        break;
      }
    }

    if (nonOrdUtxos.length === 0) {
      throw new Error('Balance not enough');
    }

    const unspent = tx.getUnspent();
    if (unspent === 0) {
      throw new Error('Balance not enough to pay network fee.');
    }

    // add dummy output
    tx.addChangeOutput(1);

    const networkFee = await tx.calNetworkFee();
    if (unspent < networkFee) {
      throw new Error(
        `Balance not enough. Need ${satoshisToAmount(networkFee)} BTC as network fee, but only ${satoshisToAmount(unspent)} BTC.`
      );
    }

    const leftAmount = unspent - networkFee;
    if (leftAmount >= UTXO_DUST) {
      // change dummy output to true output
      tx.getChangeOutput().value = leftAmount;
    } else {
      // remove dummy output
      tx.removeChangeOutput();
    }

    const psbt = await tx.createSignedPsbt();
    tx.dumpTx(psbt);

    //@ts-ignore
    psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;

    const rawtx = psbt.extractTransaction().toHex();
    const result = await this.rpcClient.pushTX(rawtx);

    return {
      txId: psbt.extractTransaction().getId(),
      ...result,
    };

  }

  async getSegwitAddressInfo({ address }) {
    const isValid = transactions.validateSegwitAddress({ address, type: 'segwit' })
    if (!isValid) {
      return { isValid, summary: null }
    }
    const summary = await this.getAddressSummary({ address })
    return { isValid, summary }
  }

  async getTaprootAddressInfo({ address }) {
    const isValid = transactions.validateTaprootAddress({ address, type: 'segwit' })
    if (!isValid) {
      return { isValid, summary: null }
    }
    const summary = await this.getAddressSummary({ address })
    return { isValid, summary }
  }

  async getBrcOffers ({ticker}) {
    const offers = await this.apiClient.getTickerOffers({_ticker: ticker});
    return offers;
  }

  async swapBrc (bid: SwapBrc ) {
    const psbt = await this.apiClient.initSwapBid({
      address: bid.address,
      auctionId: bid.auctionId,
      bidPrice: bid.bidPrice,
      pubKey: bid.pubKey
    })
    if (psbt.error) return psbt;
    const unsignedPsbt = psbt.psbtBid;
    const feeRate = psbt.feeRate;

    const swapOptions = bid;
    swapOptions["psbt"] = unsignedPsbt;
    swapOptions["feeRate"] = feeRate;

    const signedPsbt = await swapFlow(swapOptions);

    const txId = await this.apiClient.submitSignedBid({
      psbtBid: signedPsbt,
      auctionId: bid.auctionId,
      bidId: psbt.bidId
    });

    return txId;

  }

  async swapFlow (options){
    const address =  options.address;
    const feeRate =  options.feeRate;
    const mnemonic = options.mnemonic;
    const pubKey =   options.pubKey;
  
    const psbt = bitcoin.Psbt.fromHex(options.psbt, {network: bitcoin.networks.bitcoin});
    const wallet = new Wallet();
    const payload = await wallet.importWallet({
          mnemonic: mnemonic.trim(),
          hdPath: options.hdPath,
          type: options.type
      })
  
    const keyring = payload.keyring.keyring;
    const signer = keyring.signTransaction.bind(keyring);
    const from = address; 
    const addressType = transactions.getAddressType(from)
    if (addressType == null) throw Error("Invalid Address Type");
  
      const tx = new PSBTTransaction(
        signer,
        from,
        pubKey,
        addressType,
        feeRate
      );
  
     const psbt_ = await tx.signPsbt(psbt)
     
     return psbt_.toHex();
  }
}
