import { SandshrewBitcoinClient } from './sandshrew'
import { EsploraRpc } from './esplora'
import { OrdRpc } from './ord'

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
