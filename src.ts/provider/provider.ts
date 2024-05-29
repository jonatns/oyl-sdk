import { SandshrewBitcoinClient } from '../rpclient/sandshrew'
import { EsploraRpc } from '../rpclient/esplora'
import { OrdRpc } from '../rpclient/ord'
import { OylApiClient } from '../apiclient'
import * as bitcoin from 'bitcoinjs-lib'

export class Provider {
  public sandshrew: SandshrewBitcoinClient
  public esplora: EsploraRpc
  public ord: OrdRpc
  public api: OylApiClient
  public network: bitcoin.networks.Network

  constructor({
    url,
    projectId,
    network,
    version = 'v1',
  }: {
    url: string
    projectId: string
    network: bitcoin.networks.Network
    version?: string
  }) {
    let isTestnet: boolean
    let isRegtest: boolean
    switch (network) {
      case bitcoin.networks.testnet:
        isTestnet = true
      case bitcoin.networks.regtest:
        isRegtest = true
    }
    const masterUrl = `${url}/${version}/${projectId}`
    this.sandshrew = new SandshrewBitcoinClient(masterUrl)
    this.esplora = new EsploraRpc(masterUrl)
    this.ord = new OrdRpc(masterUrl)
    this.api = new OylApiClient({
      host: 'https://api.oyl.gg',
      testnet: isTestnet ? true : null,
      regtest: isRegtest ? true : null,
      apiKey: projectId,
    })
    this.network = network
  }
}
