import { Command } from 'commander'
import fs from 'fs-extra'
import { gzip as _gzip } from 'node:zlib'
import { promisify } from 'util'
import path from 'path'
import * as alkanes from '../alkanes/alkanes'
import * as utxo from '../utxo'
import { Wallet } from './wallet'
import { contractDeployment } from '../alkanes/contract'
import { send, tokenDeployment } from '../alkanes/token'


/* @dev example call
  oyl alkane trace -params '{"txid":"0322c3a2ce665485c8125cd0334675f0ddbd7d5b278936144efb108ff59c49b5","vout":0}'

  Note the json format if you need to pass an object.
*/
export const alkanesTrace = new Command('trace')
  .description('Returns data based on txid and vout of deployed alkane')
  .option(
    '-p, --provider <provider>',
    'provider to use to access the network.'
  )
  .option(
    '-params, --parameters <parameters>',
    'parameters for the ord method you are calling.'
  )
  .action(async (options) => {
    const wallet: Wallet = new Wallet(options)
    const provider = wallet.provider
    let isJson: { vout: number; txid: string }
    try {
      isJson = JSON.parse(options.parameters)
      const { vout, txid } = isJson
      console.log(await provider.alkanes.trace({ vout, txid }))
    } catch (error) {
      const { vout, txid } = isJson
      console.log(await provider.alkanes.trace({ vout, txid }))
    }
  })


/* @dev example call 
  oyl alkane new-contract -c ./src/cli/contracts/free_mint.wasm -resNumber 777

  The free_mint.wasm contract is used as an example. 

  To verify the factory contract was deployed, you can use the oyl alkane trace command 
  using the returned txid and vout: 3

  Remember to genBlocks after sending transactions to the regtest chain!
*/
export const alkaneContractDeploy = new Command('new-contract')
  .requiredOption(
    '-c, --contract <contract>',
    'Relative path to contract wasm file to deploy (e.g., "../alkanes/free_mint.wasm")'
  )
  .requiredOption(
    '-resNumber, --reserveNumber <reserveNumber>',
    'number to reserve for factory id'
  )
  .option(
    '-p, --provider <provider>',
    'Network provider type (regtest, bitcoin)'
  )
  .option('-feeRate, --feeRate <feeRate>', 'fee rate')

  .action(async (options) => {
    const wallet: Wallet = new Wallet(options)

    const { accountSpendableTotalUtxos, accountSpendableTotalBalance } =
      await utxo.accountUtxos({ 
        account: wallet.account, 
        provider: wallet.provider 
      })

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

    console.log(
      await contractDeployment({
        reserveNumber: options.reserveNumber,
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
    )
  })


/* @dev example call 
  oyl alkane new-token -pre 5000 -amount 1000 -c 100000 -name "OYL" -symbol "OL" -resNumber 777 -i ./src/cli/contracts/image.png
  
  The resNumber must be a resNumber for a deployed contract. In this case 777 is the resNumber for 
  the free_mint.wasm contract and the options supplied are for the free_mint.wasm contract.

  The token will deploy to the next available [2, n] Alkane ID.

  To get information on the deployed token, you can use the oyl alkane trace command 
  using the returned txid and vout: 4

  Remember to genBlocks after transactions...
*/
export const alkaneTokenDeploy = new Command('new-token')
  .requiredOption(
    '-resNumber, --reserveNumber <reserveNumber>',
    'Number to reserve for factory id'
  )
  .requiredOption('-c, --cap <cap>', 'the token cap')
  .requiredOption('-name, --token-name <name>', 'the token name')
  .requiredOption('-symbol, --token-symbol <symbol>', 'the token symbol')
  .requiredOption(
    '-amount, --amount-per-mint <amount-per-mint>',
    'Amount of tokens minted each time mint is called'
  )
  .option('-pre, --premine <premine>', 'amount to premine')
  .option(
    '-i, --image <image>',
    'Relative path to image file to deploy (e.g., "../alkanes/free_mint.wasm")'
  )
  .option(
    '-p, --provider <provider>',
    'Network provider type (regtest, bitcoin)'
  )
  .option('-feeRate, --feeRate <feeRate>', 'fee rate')
  .action(async (options) => {
    const wallet: Wallet = new Wallet(options)

    const { accountSpendableTotalUtxos, accountSpendableTotalBalance } = 
      await utxo.accountUtxos({ 
        account: wallet.account, 
        provider: wallet.provider 
      })

    const calldata = [
      BigInt(6),
      BigInt(options.reserveNumber),
      BigInt(0),
      BigInt(options.premine ?? 0),
      BigInt(options.amountPerMint),
      BigInt(options.cap),
      BigInt(
        '0x' +
          Buffer.from(options.tokenName.split('').reverse().join('')).toString(
            'hex'
          )
      ),
      BigInt(
        '0x' +
          Buffer.from(
            options.tokenSymbol.split('').reverse().join('')
          ).toString('hex')
      ),
    ]

    if (options.image) {
      const image = new Uint8Array(
        Array.from(
          await fs.readFile(path.resolve(process.cwd(), options.image))
        )
      )
      const gzip = promisify(_gzip)

      const payload = {
        body: await gzip(image, { level: 9 }),
        cursed: false,
        tags: { contentType: '' },
      }

      console.log(
        await tokenDeployment({
          payload,
          calldata,
          gatheredUtxos: {
            utxos: accountSpendableTotalUtxos,
            totalAmount: accountSpendableTotalBalance,
          },
          feeRate: wallet.feeRate,
          account: wallet.account,
          signer: wallet.signer,
          provider: wallet.provider,
        })
      )
      return
    }

    console.log(
      await alkanes.execute({
        calldata,
        gatheredUtxos: {
          utxos: accountSpendableTotalUtxos,
          totalAmount: accountSpendableTotalBalance,
        },
        feeRate: wallet.feeRate,
        account: wallet.account,
        signer: wallet.signer,
        provider: wallet.provider,
      })
    )
  })


/* @dev example call 
  oyl alkane execute -data 2,1,77

  In this example we call a mint (opcode 77) from the [2,1] token. The token
  will mint to the wallet calling execute.

  Hint: you can grab the TEST_WALLET's alkanes balance with:
  oyl provider alkanes -method getAlkanesByAddress -params '{"address":"bcrt1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqvg32hk"}'
*/
export const alkaneExecute = new Command('execute')
  .requiredOption(
    '-data, --calldata <calldata>',
    'op code + params to be called on a contract',
    (value, previous) => {
      const items = value.split(',')
      return previous ? previous.concat(items) : items
    },
    []
  )
  .option(
    '-m, --mnemonic <mnemonic>',
    '(optional) Mnemonic used for signing transactions (default = TEST_WALLET)'
  )
  .option(
    '-p, --provider <provider>',
    'Network provider type (regtest, bitcoin)'
  )
  .option('-feeRate, --feeRate <feeRate>', 'fee rate')
  .action(async (options) => {
    const wallet: Wallet = new Wallet(options)

    const { accountSpendableTotalUtxos, accountSpendableTotalBalance } =
      await utxo.accountUtxos({ 
        account: wallet.account, 
        provider: wallet.provider 
      })

    const calldata: bigint[] = []
    for (let i = 0; i < options.calldata.length; i++) {
      calldata.push(BigInt(options.calldata[i]))
    }
    
    console.log(
      await alkanes.execute({
        calldata,
        gatheredUtxos: {
          utxos: accountSpendableTotalUtxos,
          totalAmount: accountSpendableTotalBalance,
        },
        feeRate: wallet.feeRate,
        account: wallet.account,
        signer: wallet.signer,
        provider: wallet.provider,
      })
    )
  })


/* @dev example call 
  oyl alkane send -blk 2 -tx 1 -amt 200 -to bcrt1pkq6ayylfpe5hn05550ry25pkakuf72x9qkjc2sl06dfcet8sg25ql4dm73

  Sends an alkane token amount to a given address (example is sending token with Alkane ID [2, 1]) 
*/
export const alkaneSend = new Command('send')
  .requiredOption('-to, --to <to>')
  .requiredOption('-amt, --amount <amount>')
  .requiredOption('-blk, --block <block>')
  .requiredOption('-tx, --txNum <txNum>')
  .option(
    '-m, --mnemonic <mnemonic>',
    '(optional) Mnemonic used for signing transactions (default = TEST_WALLET)'
  )
  .option(
    '-p, --provider <provider>',
    'Network provider type (regtest, bitcoin)'
  )
  .option('-feeRate, --feeRate <feeRate>', 'fee rate')
  .action(async (options) => {
    const wallet: Wallet = new Wallet(options)

    const { accountSpendableTotalUtxos, accountSpendableTotalBalance } =
      await utxo.accountUtxos({ 
        account: wallet.account, 
        provider: wallet.provider 
      })

    console.log(
      await send({
        alkaneId: { block: options.block, tx: options.txNum },
        toAddress: options.to,
        amount: Number(options.amount),
        gatheredUtxos: {
          utxos: accountSpendableTotalUtxos,
          totalAmount: accountSpendableTotalBalance,
        },
        account: wallet.account,
        signer: wallet.signer,
        provider: wallet.provider,
        feeRate: wallet.feeRate,
      })
    )
  })
