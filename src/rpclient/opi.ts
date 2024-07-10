import fetch from 'node-fetch'

export class Opi {
  public opiUrl: string

  constructor(opiUrl: string) {
    this.opiUrl = opiUrl
  }

  async _call(url) {
    const requestOptions = {
      method: 'GET',
      cache: 'no-cache',
    }

    try {
      const response = await fetch(url, requestOptions)
      const responseData = await response.json()

      if (responseData.error) {
        console.error('Opi Error:', responseData.error)
        throw new Error(responseData.error)
      }

      return responseData.result
    } catch (error) {
      console.error('Request Error:', error)
      throw error
    }
  }
  async getBrc20Balance({
    address,
    ticker,
  }: {
    address: string
    ticker: string
  }) {
    return await this._call(
      `${this.opiUrl}/brc20/get_current_balance_of_wallet?address=${address}&ticker=${ticker}`
    )
  }

  async getUnspentBRC20ByAddress({ address }: { address: string }) {
    return (
      await this._call(
        `${this.opiUrl}/brc20/get_valid_tx_notes_of_wallet?address=${address}`
      )
    ).unused_txes
  }

  async getAllUnspentBRC20ByTicker({ ticker }: { ticker: string }) {
    return (
      await this._call(
        `${this.opiUrl}/brc20/get_valid_tx_notes_of_ticker?ticker=${ticker}`
      )
    ).unused_txes
  }

  async getBRC20HoldersByTicker({ ticker }: { ticker: string }) {
    return (await this._call(`${this.opiUrl}/brc20/holders?ticker=${ticker}`))
      .unused_txes
  }

  async getBRC20EventsByInscriptionId({ inscId }: { inscId: string }) {
    return await this._call(
      `${this.opiUrl}/brc20/event?inscription_id=${inscId}`
    )
  }
  async getUnspentRuneByAddress({ address }: { address: string }) {
    return await this._call(
      `${this.opiUrl}/runes/get_unspent_rune_outpoints_of_wallet?address=${address}`
    )
  }
}
