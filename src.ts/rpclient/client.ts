import assert from 'assert';
const bcurl = require('bcurl');
const { Client } = bcurl;


interface NodeClientOptions {
  [key: string]: any;
}

class NodeClient extends Client {
  password: string;

  constructor(options: NodeClientOptions) {
    super(options);
    this.password = options.password;
  }

  async auth(): Promise<void> {
    await this.call('auth', this.password);
    await this.watchChain();
    await this.watchMempool();
  }

  execute(name: string, params: any): Promise<any> {
    return super.execute('/', name, params);
  }

  getMempool(): Promise<any> {
    return this.get('/mempool');
  }

  getInfo(): Promise<any> {
    return this.get('/');
  }

  getCoinsByAddress(address: string): Promise<any> {
    assert(typeof address === 'string');
    return this.get(`/coin/address/${address}`);
  }

  getCoinsByAddresses(addresses: string[]): Promise<any> {
    assert(Array.isArray(addresses));
    return this.post('/coin/address', { addresses });
  }

  getCoin(hash: string, index: number): Promise<any> {
    assert(typeof hash === 'string');
    assert((index >>> 0) === index);
    return this.get(`/coin/${hash}/${index}`);
  }

  getTXByAddress(address: string): Promise<any> {
    assert(typeof address === 'string');
    return this.get(`/tx/address/${address}`);
  }

  getTXByAddresses(addresses: string[]): Promise<any> {
    assert(Array.isArray(addresses));
    return this.post('/tx/address', { addresses });
  }

  getTX(hash: string): Promise<any> {
    assert(typeof hash === 'string');
    return this.get(`/tx/${hash}`);
  }

  getBlock(block: string | number): Promise<any> {
    assert(typeof block === 'string' || typeof block === 'number');
    return this.get(`/block/${block}`);
  }

  getBlockHeader(block: string | number): Promise<any> {
    assert(typeof block === 'string' || typeof block === 'number');
    return this.get(`/header/${block}`);
  }

  getFilter(filter: string | number): Promise<any> {
    assert(typeof filter === 'string' || typeof filter === 'number');
    return this.get(`/filter/${filter}`);
  }

  broadcast(tx: string): Promise<any> {
    assert(typeof tx === 'string');
    return this.post('/broadcast', { tx });
  }

  reset(height: number): Promise<any> {
    return this.post('/reset', { height });
  }

  private watchChain(): Promise<any> {
    return this.call('watch chain');
  }

  private watchMempool(): Promise<any> {
    return this.call('watch mempool');
  }

  getTip(): Promise<any> {
    return this.call('get tip');
  }

  getEntry(block: string): Promise<any> {
    return this.call('get entry', block);
  }
}

export default NodeClient;
