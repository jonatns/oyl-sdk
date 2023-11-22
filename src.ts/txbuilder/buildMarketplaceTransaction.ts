import { IBlockchainInfoUTXO } from "../shared/interface";
import { OylApiClient } from '../apiclient'
import { EsploraRpc } from "../rpclient/esplora";


export class BuildMarketplaceTransaction {
    public walletAddress: string;
    public pubKey: string;
    public apiClient: OylApiClient
    public esploraRpc: EsploraRpc


    constructor({address, pubKey}: {address: string, pubKey: string}){
        this.walletAddress = address;
        this.pubKey = pubKey;
        this.apiClient = new OylApiClient({ host: 'https://api.oyl.gg' })
        this.esploraRpc = new EsploraRpc("https://mainnet.sandshrew.io/v1/154f9aaa25a986241357836c37f8d71")
    }
    

    async getUTXOsToCoverAmount (
        address: string,
        amountNeeded: number,
        inscriptionLocs?: string[]
      ) {
        const unspentsOrderedByValue = await getUnspentsForAddressInOrderByValue(this.walletAddress)
        const retrievedIxs = await this.apiClient.getCollectiblesByAddress(this.walletAddress)
        const bisInscriptionLocs = retrievedIxs.map(
          (utxo) => utxo.satpoint
        ) as string[]
      
        if (bisInscriptionLocs.length === 0) {
          inscriptionLocs = []
        } else {
          inscriptionLocs = bisInscriptionLocs
        }
      
        let sum = 0
        const result: IBlockchainInfoUTXO[] = []
      
        for await (let utxo of unspentsOrderedByValue) {
          const currentUTXO = utxo
          const utxoSatpoint = getSatpointFromUtxo(currentUTXO)
          if (
            (inscriptionLocs &&
              inscriptionLocs?.find((utxoLoc: any) => utxoLoc === utxoSatpoint)) ||
            currentUTXO.value <= 546
          ) {
            continue
          }
      
          sum += currentUTXO.value
          result.push(currentUTXO)
          if (sum > amountNeeded) {
            console.log('AMOUNT RETRIEVED: ', sum)
            return result
          }
        }
      
        return [] as IBlockchainInfoUTXO[]
      }
}