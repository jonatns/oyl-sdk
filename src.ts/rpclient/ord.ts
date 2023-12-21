export class OrdRpc {
  public ordUrl: string

  constructor(url: string) {
    this.ordUrl = url
  }

  async _call(method: string, params = []) {
    const requestData = {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1,
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    }

    try {
      const response = await fetch(this.ordUrl, requestOptions)
      const responseData = await response.json()

      if (responseData.error) {
        console.error('Ord JSON-RPC Error:', responseData.error)
        return null
      }

      return responseData.result
    } catch (error) {
      console.error('Request Error:', error)
      throw error
    }
  }
  async getInscriptionById(inscriptionId: string) {
    return await this._call('ord_inscription', [inscriptionId])
  }
  async getInscriptionContent(inscriptionId: string) {
    return await this._call('ord_content', [inscriptionId])
  }
  async getInscriptionByNumber(number: string) {
    return await this._call('ord_inscription', [number])
  }

  async getInscriptions(numberToReturn: string, startingWith?: string) {
    return await this._call('ord_inscriptions', [startingWith, numberToReturn])
  }

  async getInscriptionsByBlockHash(blockHash: string) {
    return await this._call('ord_block', [blockHash])
  }

  async getInscriptionsByBlockHeight(blockHash: string) {
    return await this._call('ord_block', [blockHash])
  }
  async getInscriptionBySat(satNumber: string) {
    return await this._call('ord_r:sat', [satNumber])
  }
  async getInscriptionBySatWithIndex(satNumber: string, index?: string) {
    return await this._call('ord_r:sat::at', [satNumber, index])
  }
  async getInscriptionChildren(inscriptionId: string, page?: string) {
    return await this._call('ord_r:children', [inscriptionId, page])
  }
  async getInscriptionMetaData(inscriptionId: string) {
    return await this._call('ord_r:metadata', [inscriptionId])
  }
  async getTxOutput(txIdVout: string) {
    return await this._call('ord_output', [txIdVout])
  }
  async getSatByNumber(number: string) {
    return await this._call('ord_sat', [number])
  }
  async getSatByDecimal(decimal: string) {
    return await this._call('ord_sat', [decimal])
  }
  async getSatByDegree(degree: string) {
    return await this._call('ord_sat', [degree])
  }
  async getSatByBase26(base26: string) {
    return await this._call('ord_sat', [base26])
  }
  async getSatByPercentage(percentage: string) {
    return await this._call('ord_sat', [percentage])
  }
}
