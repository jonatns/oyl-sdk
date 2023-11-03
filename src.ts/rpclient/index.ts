import assert from 'assert'
const bcurl = require('bcurl')
const { Client } = bcurl


/**
 * Interface for Bcoin RPC client options.
 */
interface BcoinRpcOptions {
  password?: string;
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

   /**
   * Fetches a transaction based on its hash.
   * @param hash - The transaction hash to query.
   * @returns A promise resolving with the transaction data.
   */
  getTX(hash: string): Promise<any> {
    assert(typeof hash === 'string')
    return this.get(`/tx/${hash}`)
  }

  /**
   * Broadcasts a transaction based on its hash.
   * @param hash - The transaction hash to broadcast.
   * @returns A promise resolving with the broadcast result.
   */
  pushTX(hash: string): Promise<any> {
    assert(typeof hash === 'string')
    return this.post(`/broadcast`, { tx: hash })
  }

  /**
   * Retrieves block data based on its identifier.
   * @param block - The block hash or block height to query.
   * @returns A promise resolving with the block data.
   */
  getBlock(block: string | number): Promise<any> {
    assert(typeof block === 'string' || typeof block === 'number')
    return this.get(`/block/${block}`)
  }

  /**
   * Retrieves block header data based on its identifier.
   * @param block - The block hash or block height to query.
   * @returns A promise resolving with the block header data.
   */
  getBlockHeader(block: string | number): Promise<any> {
    assert(typeof block === 'string' || typeof block === 'number')
    return this.get(`/header/${block}`)
  }

  /**
   * Fetches filter data based on its identifier.
   * @param filter - The filter hash or filter height to query.
   * @returns A promise resolving with the filter data.
   */
  getFilter(filter: string | number): Promise<any> {
    assert(typeof filter === 'string' || typeof filter === 'number')
    return this.get(`/filter/${filter}`)
  }

  /**
   * Broadcasts a given transaction.
   * @param tx - The transaction string to broadcast.
   * @returns A promise resolving with the broadcast result.
   */
  broadcast(tx: string): Promise<any> {
    assert(typeof tx === 'string')
    return this.post('/broadcast', { tx })
  }

  /**
   * Resets the blockchain to a specific height.
   * @param height - The block height to reset to.
   * @returns A promise resolving with the reset result.
   */
  reset(height: number): Promise<any> {
    return this.post('/reset', { height })
  }

  /**
   * Subscribes to watch changes on the blockchain.
   * @returns A promise resolving with the subscription result.
   */
  private watchChain(): Promise<any> {
    return this.call('watch chain')
  }

   /**
   * Subscribes to watch changes in the mempool.
   * @returns A promise resolving with the subscription result.
   */
  private watchMempool(): Promise<any> {
    return this.call('watch mempool')
  }

  /**
   * Retrieves the current tip of the blockchain.
   * @returns A promise resolving with the tip data.
   */
  getTip(): Promise<any> {
    return this.call('get tip')
  }

  /**
   * Fetches block entry data based on its identifier.
   * @param block - The block hash to query.
   * @returns A promise resolving with the block entry data.
   */
  getEntry(block: string): Promise<any> {
    return this.call('get entry', block)
  }
}

export default BcoinRpc
