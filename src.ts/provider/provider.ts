import { SandshrewBitcoinClient } from '../rpclient/sandshrew'
import { EsploraRpc } from '../rpclient/esplora'
import { OrdRpc } from '../rpclient/ord'

export class Provider {
  public sandshrew: SandshrewBitcoinClient
  public esplora: EsploraRpc
  public ord: OrdRpc

  constructor(url) {
    this.sandshrew = new SandshrewBitcoinClient(url)
    this.esplora = new EsploraRpc(url)
    this.ord = new OrdRpc(url)
  }
}
