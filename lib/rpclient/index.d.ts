declare const Client: any;
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
declare class BcoinRpc extends Client {
    password: string;
    /**
     * Initialize a new Bcoin RPC client.
     * @param options - The options for the Bcoin RPC client.
     */
    constructor(options: BcoinRpcOptions);
    /**
     * Authenticates with the Bcoin RPC API.
     */
    auth(): Promise<void>;
    /**
     * Execute an RPC call.
     * @param name - The RPC method name.
     * @param params - The parameters for the RPC call.
     * @returns A promise resolving the RPC call response.
     */
    execute(name: string, params?: any): Promise<any>;
    /**
     * Retrieves the mempool state.
     * @returns A promise resolving with mempool data.
     */
    getMempool(): Promise<any>;
    /**
     * Retrieves blockchain and node information.
     * @returns A promise resolving with the info data.
     */
    getInfo(): Promise<any>;
    /**
     * Fetches coins associated with a given address.
     * @param address - The address to query.
     * @returns A promise resolving with the coin data.
     */
    getCoinsByAddress(address: string): Promise<any>;
    /**
     * Fetches coins associated with multiple addresses.
     * @param addresses - Array of addresses to query.
     * @returns A promise resolving with the coin data.
     */
    getCoinsByAddresses(addresses: string[]): Promise<any>;
    /**
     * Fetches coin data based on its hash and output index.
     * @param hash - The transaction hash of the coin.
     * @param index - The output index of the coin.
     * @returns A promise resolving with the coin data.
     */
    getCoin(hash: string, index: number): Promise<any>;
    /**
     * Retrieves transactions associated with a given address.
     * @param address - The address to query.
     * @returns A promise resolving with the transaction data.
     */
    getTxByAddress(address: string): Promise<any>;
    /**
     * Retrieves transactions associated with multiple addresses.
     * @param addresses - Array of addresses to query.
     * @returns A promise resolving with the transaction data.
     */
    getTxByAddresses(addresses: string[]): Promise<any>;
    /**
     * Fetches a transaction based on its hash.
     * @param hash - The transaction hash to query.
     * @returns A promise resolving with the transaction data.
     */
    getTX(hash: string): Promise<any>;
    /**
     * Broadcasts a transaction based on its hash.
     * @param hash - The transaction hash to broadcast.
     * @returns A promise resolving with the broadcast result.
     */
    pushTX(hash: string): Promise<any>;
    /**
     * Retrieves block data based on its identifier.
     * @param block - The block hash or block height to query.
     * @returns A promise resolving with the block data.
     */
    getBlock(block: string | number): Promise<any>;
    /**
     * Retrieves block header data based on its identifier.
     * @param block - The block hash or block height to query.
     * @returns A promise resolving with the block header data.
     */
    getBlockHeader(block: string | number): Promise<any>;
    /**
     * Fetches filter data based on its identifier.
     * @param filter - The filter hash or filter height to query.
     * @returns A promise resolving with the filter data.
     */
    getFilter(filter: string | number): Promise<any>;
    /**
     * Broadcasts a given transaction.
     * @param tx - The transaction string to broadcast.
     * @returns A promise resolving with the broadcast result.
     */
    broadcast(tx: string): Promise<any>;
    /**
     * Resets the blockchain to a specific height.
     * @param height - The block height to reset to.
     * @returns A promise resolving with the reset result.
     */
    reset(height: number): Promise<any>;
    /**
     * Subscribes to watch changes on the blockchain.
     * @returns A promise resolving with the subscription result.
     */
    private watchChain;
    /**
     * Subscribes to watch changes in the mempool.
     * @returns A promise resolving with the subscription result.
     */
    private watchMempool;
    /**
     * Retrieves the current tip of the blockchain.
     * @returns A promise resolving with the tip data.
     */
    getTip(): Promise<any>;
    /**
     * Fetches block entry data based on its identifier.
     * @param block - The block hash to query.
     * @returns A promise resolving with the block entry data.
     */
    getEntry(block: string): Promise<any>;
}
export default BcoinRpc;
