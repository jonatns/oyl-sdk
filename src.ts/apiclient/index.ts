import fetch from 'node-fetch'
import { SwapBrcBid, SignedBid } from '../shared/interface'

/**
 * Represents the client for interacting with the Oyl API.
 */
export class OylApiClient {
  private host: string
  private testnet: boolean

  /**
   * Create an instance of the OylApiClient.
   * @param options - Configuration object containing the API host.
   */
  constructor(options?: { host: string; testnet?: boolean }) {
    this.host = options?.host || ''
    this.testnet = options.testnet == true
  }

  /**
   * Create an instance of the OylApiClient from a plain object.
   * @param data - The data object.
   * @returns An instance of OylApiClient.
   */
  static fromObject(data: { host: string; testnet?: boolean }): OylApiClient {
    return new this(data)
  }

  /**
   * Convert this OylApiClient instance to a plain object.
   * @returns The plain object representation.
   */
  toObject(): { host: string; testnet: boolean } {
    return {
      host: this.host,
      testnet: this.testnet,
    }
  }

  private async _call(path: string, method: string, data?: any) {
    try {
      const options: RequestInit = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      }
      if (this.testnet) {
        data['testnet'] = this.testnet
      }

      if (['post', 'put', 'patch'].includes(method)) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(`${this.host}${path}`, options)
      return await response.json()
    } catch (err) {
      throw err
    }
  }

  /**
   * Get brc20 info by ticker.
   * @param ticker - The hash to query.
   */
  async getBrc20TokenInfo(ticker: string) {
    return await this._call('/get-brc20-token-info', 'post', {
      ticker: ticker,
    })
  }
  /**
   * Get Brc20 balances by address.
   * @param address - The address to query.
   */

  async getBrc20sByAddress(address: string) {
    return await this._call('/get-address-brc20-balance', 'post', {
      address: address,
    })
  }

  async getAllInscriptionsByAddress(address: string): Promise<any> {
    return await this._call('/get-inscriptions', 'post', {
      address: address,
      exclude_brc20: false,
      count: 20,
      order: 'desc',
    })
  }

  async getInscriptionsForTxn(txn_id: string): Promise<any> {
    const res = await this._call('/get-inscriptions-for-txn', 'post', {
      tx_id: txn_id,
      testnet: this.testnet,
    })

    return res.data
  }

  /**
   * Get collectible by ID.
   * @param id - The ID of the collectible.
   */
  async getCollectiblesById(id: string): Promise<any> {
    return await this._call('/get-inscription-info', 'post', {
      inscription_id: id,
    })
  }

  /**
   * Get collectibles by address.
   * @param address - The address to query.
   */
  async getCollectiblesByAddress(address: string): Promise<any> {
    return await this._call('/get-inscriptions', 'post', {
      address: address,
      exclude_brc20: false,
    })
  }

  /**
   * Get Unisat ticker offers.
   * @param _ticker - The ticker to query.
   */
  async getUnisatTickerOffers({ ticker }: { ticker: string }): Promise<any> {
    const response = await this._call('/get-token-unisat-offers', 'post', {
      ticker: ticker,
    })
    if (response.error) throw Error(response.error)
    return response.data.list
  }

  /**
   * Get Aggregated brc20 ticker offers for a limit order.
   * @param ticker - The ticker to query.
   * @param limitOrderAmount - The limit order amount.
   * @param marketPrice - The limit order market price.
   * @param testnet - mainnet/testnet network toggle.
   */
  async getAggregatedOffers({
    ticker,
    limitOrderAmount,
    marketPrice,
    testnet,
  }: {
    ticker: string
    limitOrderAmount: number
    marketPrice: number
    testnet?: boolean
  }): Promise<any> {
    const response = await this._call('/get-brc20-aggregate-offers', 'post', {
      ticker: ticker,
      limitOrderAmount,
      marketPrice,
      testnet,
    })
    if (response.error) throw Error(response.error)
    return response
  }

  /**
   * Get Okx ticker offers.
   * @param _ticker - The ticker to query.
   */
  async getOkxTickerOffers({ ticker }: { ticker: string }): Promise<any> {
    const response = await this._call('/get-token-okx-offers', 'post', {
      ticker: ticker,
    })
    if (response.error) throw Error(response.error)
    return response.data.items
  }

  /**
   * Get Okx offer psbt.
   * @param offerId - The offer Id to query.
   */
  async getOkxOfferPsbt({ offerId }: { offerId: number }): Promise<any> {
    const response = await this._call('/get-token-okx-offers', 'post', {
      offerId: offerId,
    })
    return response
  }

  /**
   * Get Omnisat offer psbt.
   * @param offerId - The offer Id to query.
   */
  async getOmnisatOfferPsbt({
    offerId,
    ticker,
    testnet,
  }: {
    offerId: string
    ticker: string
    testnet?: boolean
  }): Promise<any> {
    const response = await this._call('/get-omnisat-offer-psbt', 'post', {
      offerId: offerId,
      ticker: ticker,
      testnet,
    })
    return response
  }

  /**
   * Initialize a swap bid.
   * @param params - Parameters for the bid.
   */
  async initSwapBid(params: SwapBrcBid): Promise<any> {
    return await this._call('/initiate-bid', 'post', params)
  }

  /**
   * Submit a signed bid.
   * @param params - Parameters for the signed bid.
   */
  async submitSignedBid(params: SignedBid): Promise<any> {
    return await this._call('/finalize-bid', 'post', params)
  }
}
