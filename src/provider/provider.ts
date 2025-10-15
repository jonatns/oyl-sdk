import { SandshrewBitcoinClient } from '../rpclient/sandshrew'
import { EsploraRpc } from '../rpclient/esplora'
import { OrdRpc } from '../rpclient/ord'
import * as bitcoin from 'bitcoinjs-lib'
import { delay, waitForTransaction } from '../shared/utils'
import { AlkanesRpc } from '../rpclient/alkanes'

export type ProviderConstructorArgs = {
  url: string
  projectId: string
  network: bitcoin.networks.Network
  networkType: 'signet' | 'mainnet' | 'testnet' | 'regtest'
  version?: string
  apiProvider?: any
}

export class Provider {
  public sandshrew: SandshrewBitcoinClient
  public esplora: EsploraRpc
  public ord: OrdRpc
  public api: any
  public alkanes: AlkanesRpc
  public network: bitcoin.networks.Network
  public networkType: string
  public url: string

  constructor({
    url,
    projectId,
    network,
    networkType,
    version = 'v1',
    apiProvider,
  }: ProviderConstructorArgs) {
    let isTestnet: boolean
    let isRegtest: boolean
    switch (network) {
      case bitcoin.networks.testnet:
        isTestnet = true

      case bitcoin.networks.regtest:
        isRegtest = true
    }
    const masterUrl = [url, version, projectId].filter(Boolean).join('/')
    this.alkanes = new AlkanesRpc(masterUrl)
    this.sandshrew = new SandshrewBitcoinClient(masterUrl)
    this.esplora = new EsploraRpc(masterUrl)
    this.ord = new OrdRpc(masterUrl)
    this.api = apiProvider
    this.network = network
    this.networkType = networkType
    this.url = masterUrl
  }

  async pushPsbt({
    psbtHex,
    psbtBase64,
  }: {
    psbtHex?: string
    psbtBase64?: string
  }) {
    if (!psbtHex && !psbtBase64) {
      throw new Error('Please supply PSBT in either base64 or hex format')
    }
    if (psbtHex && psbtBase64) {
      throw new Error('Please select only one format of PSBT to broadcast')
    }

    console.log('🔹 Loading PSBT...')
    const psbt = psbtHex
      ? bitcoin.Psbt.fromHex(psbtHex, { network: this.network })
      : bitcoin.Psbt.fromBase64(psbtBase64!, { network: this.network })

    console.log('🔹 Extracting transaction from PSBT...')
    let extractedTx: bitcoin.Transaction
    try {
      extractedTx = psbt.extractTransaction()
    } catch (err) {
      throw new Error(`Transaction could not be extracted from PSBT: ${err}`)
    }

    const txId = extractedTx.getId()
    const rawTx = extractedTx.toHex()
    console.log(`📦 Transaction ID: ${txId}`)

    console.log('🔹 Testing mempool acceptance...')
    const [result] = await this.sandshrew.bitcoindRpc.testMemPoolAccept([rawTx])
    if (!result.allowed) {
      throw new Error(
        `Mempool rejected transaction: ${result['reject-reason']}`
      )
    }

    console.log('🚀 Broadcasting transaction...')
    await this.sandshrew.bitcoindRpc.sendRawTransaction(rawTx)

    // Retry mempool check
    let txInfo
    for (let i = 0; i < 10; i++) {
      try {
        txInfo = await this.sandshrew.bitcoindRpc.getMemPoolEntry(txId)
        if (txInfo) break
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 1000))
    }

    // Fallback: check Esplora
    if (!txInfo) {
      console.log('⚠️ Transaction not found in mempool, checking Esplora...')
      const tx = await this.esplora.getTxInfo(txId)
      if (!tx || !tx.status.confirmed) {
        throw new Error('Transaction not found in mempool or confirmed')
      }
      txInfo = tx
    }

    const fee = txInfo.fees?.base ? txInfo.fees.base * 1e8 : txInfo.fee

    console.log('✅ Transaction broadcasted successfully!')

    return {
      txId,
      rawTx,
      size: txInfo.vsize ?? txInfo.size,
      weight: txInfo.weight,
      fee,
      satsPerVByte: (fee / ((txInfo.weight ?? txInfo.size * 4) / 4)).toFixed(2),
    }
  }
}
