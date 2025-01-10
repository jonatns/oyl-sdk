import { Command } from 'commander'
import fs from 'fs-extra'
import { gzip as _gzip } from 'node:zlib'
import { promisify } from 'util'
import path from 'path'

import { Wallet } from './wallet'
import * as alkanes from '../alkanes'
import * as utxo from '../utxo'
import { timeout } from '../shared/utils'

const DEFAULT_RESERVE_NUMBER = '0x7'

/* @dev example calls
  oyl alkane factoryWasmDeploy -c ./src/alkanes/free_mint.wasm -r "0x7" 
*/

export const factoryWasmDeploy = new Command('factoryWasmDeploy')
  .requiredOption(
    '-c, --contract <contract>',
    'Relative path to contract wasm file to deploy (e.g., "../alkanes/free_mint.wasm")'
  )
  .option(
    '-r, --reserveNumber <reserveNumber>',
    `Number (in hex) to reserve for factory id `
  )
  .option(
    '-n, --networkType <networkType>',
    '(optional) Network type: regtest | mainnet (default = regtest)'
  )
  .option(
    '-m, --mnemonic <mnemonic>',
    '(optional) Mnemonic used for signing transactions (default = abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about)'
  )
  .option('-feeRate, --feeRate <feeRate>', '(optional) Fee rate')

  .action(async (options) => {
    console.log(`Deploying contract ${options.contract}`)
    const wallet = new Wallet({
      mnemonic: options.mnemonic,
      feeRate: options.feeRate,
    });

    const contract = new Uint8Array(
      Array.from(
        await fs.readFile(path.resolve(process.cwd(), options.contract))
      )
    )
    const gzip = promisify(_gzip)

    const payload = {
      body: await gzip(contract, { level: 9 }),
      cursed: false,
      tags: { contentType: '' },
    }

    const { accountSpendableTotalUtxos, accountSpendableTotalBalance } =
      await utxo.accountUtxos({ account: wallet.account, provider: wallet. provider })

    const { txId: commitTxId, script } = await alkanes.deployCommit({
      payload,
      gatheredUtxos: {
        utxos: accountSpendableTotalUtxos,
        totalAmount: accountSpendableTotalBalance,
      },
      feeRate: wallet.feeRate,
      account: wallet.account,
      signer: wallet.signer,
      provider: wallet.provider,
    })

    console.log('Commit txid: ', commitTxId);


    const mempool = await wallet.provider.sandshrew.bitcoindRpc.getRawMemPool(true)
    const mempoolTxs = Object.keys(mempool)
    console.log('mempool transactions: ', mempoolTxs)

    const blockHash = await wallet.provider.sandshrew.bitcoindRpc.generateBlock(
      wallet.account.nativeSegwit.address,
      mempoolTxs
    )

    console.log('Block hash: ', blockHash)

    await timeout(5000)

    const { txId: revealTxId } = await alkanes.deployReveal({
      createReserveNumber: options.reserveNumber || DEFAULT_RESERVE_NUMBER,
      commitTxId: commitTxId,
      script: script,
      account: wallet.account,
      provider: wallet.provider,
      feeRate: wallet.feeRate,
      signer: wallet.signer,
    })

    console.log('Reveal txid: ', revealTxId)

    const mempool2 = await wallet.provider.sandshrew.bitcoindRpc.getRawMemPool(true)
    const mempoolTxs2 = Object.keys(mempool2)
    console.log('mempool transactions: ', mempoolTxs2)
    const blockHash2 = await wallet.provider.sandshrew.bitcoindRpc.generateBlock(
      wallet.account.nativeSegwit.address,
      mempoolTxs2
    )
    console.log('Block hash: ', blockHash2)
    await timeout(5000)

    const contractTrace = await wallet.provider.alkanes.trace({
      txid: revealTxId,
      vout: 3
    });

    console.log('Contract trace: ', contractTrace)
  })