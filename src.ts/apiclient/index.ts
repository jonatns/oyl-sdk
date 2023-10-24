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

  async _call(path: string, method: string, data?: any) {
    const options: RequestInit = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
    }

    if (method === 'post' || method === 'put' || method === 'patch') {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(`${this.host + path}`, options)
    const payload = await response.json()
    return payload
  }
  catch(err) {
    return err
  }

  async importAddress({ address }: { address: String }) {
    return await this._call('/import-address', 'post', { address: address })
  }

  async pushTx({ transactionHex }: { transactionHex: String }) {
    return await this._call('/broadcast-transaction', 'post', {
      transactionHex: transactionHex,
    })
  }

  async getTxByAddress(address: string) {
    return await this._call('/address-transactions', 'post', {
      address: address,
    })
  }

  async getBrc20sByAddress(address: string) {
    return await this._call('/get-address-brc20-balance', 'post', {
      address: address,
    })
  }

  async getCollectiblesById(id: string) {
    return await this._call('/get-inscription-info', 'post', {
      inscription_id: id,
    })
  }

  async getCollectiblesByAddress(address: string) {
    return await this._call('/get-inscriptions', 'post', {
      address: address,
      exclude_brc20: true,
    })
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
    const response = await this._call('/get-token-offers', 'post', {
      ticker: _ticker,
    })
    const list = response.data.list
    return list
  }

  async initSwapBid({ address, auctionId, bidPrice, pubKey }: SwapBrcBid) {
    return await this._call('/initiate-bid', 'post', {
      address,
      auctionId,
      bidPrice,
      pubKey,
    })
  }

  async submitSignedBid({ psbtBid, auctionId, bidId }: SignedBid) {
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
