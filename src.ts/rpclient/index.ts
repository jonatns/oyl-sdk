import assert from 'assert'
const bcurl = require('bcurl')
const { Client } = bcurl


/**
 * Interface for Bcoin RPC client options.
 */
interface BcoinRpcOptions {
  password: string;
  [key: string]: any;
}

/**
 * BcoinRpc is a client for interacting with Bcoin's RPC API.
 */
class BcoinRpc extends Client {
  password: string

  /**
   * Initialize a new Bcoin RPC client.
   * @param options - The options for the Bcoin RPC client.
   */
  constructor(options: BcoinRpcOptions) {
    super(options)
    this.password = options.password
  }

  /**
   * Authenticates with the Bcoin RPC API.
   */
  async auth(): Promise<void> {
    await this.call('auth', this.password)
    await this.watchChain()
    await this.watchMempool()
  }

  /**
   * Execute an RPC call.
   * @param name - The RPC method name.
   * @param params - The parameters for the RPC call.
   * @returns A promise resolving the RPC call response.
   */
  execute(name: string, params?: any): Promise<any> {
    return super.execute('/', name, params)
  }

   /**
   * Retrieves the mempool state.
   * @returns A promise resolving with mempool data.
   */
  getMempool(): Promise<any> {
    return this.get('/mempool')
  }

  /**
   * Retrieves blockchain and node information.
   * @returns A promise resolving with the info data.
   */
  getInfo(): Promise<any> {
    return this.get('/')
  }

  /**
   * Fetches coins associated with a given address.
   * @param address - The address to query.
   * @returns A promise resolving with the coin data.
   */
  getCoinsByAddress(address: string): Promise<any> {
    assert(typeof address === 'string')
    return this.get(`/coin/address/${address}`)
  }

   /**
   * Fetches coins associated with multiple addresses.
   * @param addresses - Array of addresses to query.
   * @returns A promise resolving with the coin data.
   */
  getCoinsByAddresses(addresses: string[]): Promise<any> {
    assert(Array.isArray(addresses))
    return this.post('/coin/address', { addresses })
  }

   /**
   * Fetches coin data based on its hash and output index.
   * @param hash - The transaction hash of the coin.
   * @param index - The output index of the coin.
   * @returns A promise resolving with the coin data.
   */
  getCoin(hash: string, index: number): Promise<any> {
    assert(typeof hash === 'string')
    assert(index >>> 0 === index)
    return this.get(`/coin/${hash}/${index}`)
  }

  /**
   * Retrieves transactions associated with a given address.
   * @param address - The address to query.
   * @returns A promise resolving with the transaction data.
   */
  getTxByAddress(address: string): Promise<any> {
    assert(typeof address === 'string')
    return this.get(`/tx/address/${address}`)
  }

  /**
   * Retrieves transactions associated with multiple addresses.
   * @param addresses - Array of addresses to query.
   * @returns A promise resolving with the transaction data.
   */
  getTxByAddresses(addresses: string[]): Promise<any> {
    assert(Array.isArray(addresses))
    return this.post('/tx/address', { addresses })
  }

  getTX(hash: string): Promise<any> {
    assert(typeof hash === 'string')
    return this.get(`/tx/${hash}`)
  }

  pushTX(hash: string): Promise<any> {
    assert(typeof hash === 'string')
    return this.post(`/broadcast`, { tx: hash })
  }

  getBlock(block: string | number): Promise<any> {
    assert(typeof block === 'string' || typeof block === 'number')
    return this.get(`/block/${block}`)
  }

  getBlockHeader(block: string | number): Promise<any> {
    assert(typeof block === 'string' || typeof block === 'number')
    return this.get(`/header/${block}`)
  }

  getFilter(filter: string | number): Promise<any> {
    assert(typeof filter === 'string' || typeof filter === 'number')
    return this.get(`/filter/${filter}`)
  }

  broadcast(tx: string): Promise<any> {
    assert(typeof tx === 'string')
    return this.post('/broadcast', { tx })
  }

  reset(height: number): Promise<any> {
    return this.post('/reset', { height })
  }

  private watchChain(): Promise<any> {
    return this.call('watch chain')
  }

  private watchMempool(): Promise<any> {
    return this.call('watch mempool')
  }

  getTip(): Promise<any> {
    return this.call('get tip')
  }

  getEntry(block: string): Promise<any> {
    return this.call('get entry', block)
  }
}

export default BcoinRpc
