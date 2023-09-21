import fetch from 'node-fetch'
import { SwapBrcBid, SignedBid } from '../shared/interface'

export class OylApiClient {
  private host: String

  constructor(options?) {
    try {
      this.host = options.host
    } catch (err) {
      return err
    }
  }

  static fromObject(data) {
    const result = new this(data)
    return result
  }

  toObject() {
    return {
      host: this.host,
    }
  }

  async _call(path, method, data: any = null) {
    const response = await fetch(`${this.host + path}`, {
      method: method,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
    const payload = await response.json();
    return payload
  }
  catch(err) {
    return err
  }

  async importAddress({ address }: { address: String }) {
    return await this._call('/import-address', 'post', { address: address })
  }

  async listWallet() {
    return await this._call('/list-wallets', 'get')
  }

  async listTx() {
    return await this._call('/list-tx', 'get')
  }

  async getRawMempool() {
    return await this._call('/mempool', 'get')
  }

  async getMempoolInfo() {
    return await this._call('/mempool-info', 'get')
  }

  async getTickerOffers({ _ticker }: { _ticker: String }) {
    const response = await this._call('/get-token-offers', 'post', { ticker: _ticker })
    const list = response.data.list;
    return list
  }

  async initSwapBid({
    address,
    auctionId,
    bidPrice,
    pubKey,
  }: SwapBrcBid) {
    return await this._call('/initiate-bid', 'post', {
      address,
      auctionId,
      bidPrice,
      pubKey,
    })
  }

  async submitSignedBid({
    psbtBid,
    auctionId,
    bidId,
  }: SignedBid) {
    return await this._call('/finalize-bid', 'post', {
      psbtBid,
      auctionId,
      bidId,
    })
  }

  async getFees() {
    return await this._call('/get-fees', 'get')
  }

  async subscribe({
    webhookUrl,
    rbf = false,
  }: {
    webhookUrl: String
    rbf?: Boolean
  }) {
    return await this._call('/subscribe-webhook', 'post', {
      webhookUrl: webhookUrl,
      rbf: rbf,
    })
  }

  async importSubscribe({
    address,
    webhookUrl,
    rbf,
  }: {
    address: String
    webhookUrl: String
    rbf?: Boolean
  }) {
    await this.importAddress({ address })
    await this.subscribe({ webhookUrl, rbf })
  }
}
