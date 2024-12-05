import fetch from 'node-fetch'

interface AlkanesResponse {}
interface AlkaneSimulateRequest {
  alkanes: any[]
  transaction: string
  block: string
  height: string
  txindex: number
  target: {
    block: string
    tx: string
  }
  inputs: string[]
  pointer: number
  refundPointer: number
  vout: number
}

export class AlkanesRpc {
  public alkanesUrl: string

  constructor(url: string) {
    this.alkanesUrl = url
  }

  async _call(method, params = []) {
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
      cache: 'no-cache',
    }

    try {
      const response = await fetch(this.alkanesUrl, requestOptions)
      const responseData = await response.json()

      if (responseData.error) {
        console.error('Alkanes JSON-RPC Error:', responseData.error)
        throw new Error(responseData.error)
      }

      return responseData.result
    } catch (error) {
      console.error('Request Error:', error)
      throw error
    }
  }

  async getAlkanesByHeight({
    blockHeight,
    protocolTag = '1',
  }: {
    blockHeight: number
    protocolTag: string
  }) {
    return (await this._call('alkanes_protorunesbyheight', [
      {
        blockHeight,
        protocolTag,
      },
    ])) as AlkanesResponse
  }

  async getAlkanesByAddress({
    address,
    protocolTag = '1',
  }: {
    address: string
    protocolTag?: string
  }) {
    return (await this._call('alkanes_protorunesbyaddress', [
      {
        address,
        protocolTag,
      },
    ])) as AlkanesResponse
  }

  async simulate(request: AlkaneSimulateRequest) {
    return await this._call('alkanes_simulate', [request])
  }
  async getAlkanesByOutpoint({
    txid,
    vout,
    protocolTag = '1',
  }: {
    txid: string
    vout: number
    protocolTag?: string
  }): Promise<any> {
    return await this._call('alkanes_protorunesbyoutpoint', [
      { txid: '0x' + txid, vout, protocolTag },
    ])
  }
}
