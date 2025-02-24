import { findAlkaneUtxos } from '../alkanes/alkanes'
import { u128 } from '@magiceden-oss/runestone-lib/dist/src/integer/u128'
import { u32 } from '@magiceden-oss/runestone-lib/dist/src/integer/u32'
import { encipher } from 'alkanes/lib/bytes'
import { encodeRunestoneProtostone } from 'alkanes/lib/protorune/proto_runestone_upgrade'
import { ProtoruneEdict } from 'alkanes/lib/protorune/protoruneedict'
import { ProtoruneRuneId } from 'alkanes/lib/protorune/protoruneruneid'
import { ProtoStone } from 'alkanes/lib/protorune/protostone'
import { Account, alkanes, Provider, Signer, utxo } from '..'
import { AlkaneId, Utxo } from 'shared/interface'

const BURN_OUTPUT = u32(2)

export type CreateNewPoolSimulationResult = {
  lpTokens: string;
  alkaneId: AlkaneId;
};

export type FindExistingPoolIdSimulationResult = {
  alkaneId: AlkaneId;
};

export enum PoolFactoryOpcodes {
  INIT_POOL = 0, 
  CREATE_NEW_POOL = 1,
  FIND_EXISTING_POOL_ID = 2,
}

export const parseAlkaneIdFromHex = (hex: string): AlkaneId => {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex

  const blockHex = cleanHex.slice(0, 32)
  const txHex = cleanHex.slice(32)

  const reversedBlockHex = Buffer.from(blockHex, 'hex').reverse().toString('hex')
  const reversedTxHex = Buffer.from(txHex, 'hex').reverse().toString('hex')

  const block = parseInt(reversedBlockHex, 16).toString()
  const tx = parseInt(reversedTxHex, 16).toString()
  
  return { block, tx }
}

export class AlkanesAMMPoolFactoryDecoder {
  decodeCreateNewPool(execution: any): CreateNewPoolSimulationResult | undefined {
    if (!execution?.alkanes?.[0]?.u?.[1]?.[0] || !execution?.alkanes?.[0]?.u?.[0]) {
      return undefined;
    }

    return {
      lpTokens: execution.alkanes[0].u[1][0].toString(),
      alkaneId: {
        block: execution.alkanes[0].u[0][0][0],
        tx: execution.alkanes[0].u[0][1][0]
      }
    };
  }

  decodeFindExistingPoolId(execution: any): FindExistingPoolIdSimulationResult | undefined {
    if (!execution?.data || execution.data === '0x') {
      return undefined;
    }
    const bytes = parseAlkaneIdFromHex(execution.data);
    return {
      alkaneId: {
        block: bytes.block.toString(),
        tx: bytes.tx.toString()
      }
    };
  }

  static decodeSimulation(result: any, opcode: number) {
    if (!result || typeof result.status === 'undefined') {
      return {
        success: false,
        error: 'Invalid simulation result',
        gasUsed: 0
      };
    }

    const decoder = new AlkanesAMMPoolFactoryDecoder();
    let decoded;
    
    switch (opcode) {
      case PoolFactoryOpcodes.INIT_POOL:
        // Not implemented
        break;
      case PoolFactoryOpcodes.CREATE_NEW_POOL:
        decoded = decoder.decodeCreateNewPool(result.execution);
        break;
      case PoolFactoryOpcodes.FIND_EXISTING_POOL_ID:
        decoded = decoder.decodeFindExistingPoolId(result.execution);
        break;
      default:
        decoded = undefined;
    }

    return decoded
  }
}

export const getPoolId = async () => { }

export const createNewPool = async (
  calldata: bigint[],
  token0: AlkaneId,
  token0Amount: bigint,
  token1: AlkaneId,
  token1Amount: bigint,
  gatheredUtxos: { utxos: Utxo[]; totalAmount: number },
  feeRate: number,
  account: Account,
  signer: Signer,
  provider: Provider
) => {
  let tokenUtxos: {
    alkaneUtxos: any[]
    totalSatoshis: number
    totalSentToken0: number
    totalSentToken1: number
  }

  const [token0Utxos, token1Utxos] = await Promise.all([
    findAlkaneUtxos({
      address: account.taproot.address,
      greatestToLeast: false,
      provider,
      targetNumberOfAlkanes: Number(token0Amount),
      alkaneId: token0,
    }),
    findAlkaneUtxos({
      address: account.taproot.address,
      greatestToLeast: false,
      provider,
      targetNumberOfAlkanes: Number(token1Amount),
      alkaneId: token1,
    }),
  ])

  tokenUtxos = {
    alkaneUtxos: [...token0Utxos.alkaneUtxos, ...token1Utxos.alkaneUtxos],
    totalSatoshis: token0Utxos.totalSatoshis + token1Utxos.totalSatoshis,
    totalSentToken0: token0Utxos.totalBalanceBeingSent,
    totalSentToken1: token1Utxos.totalBalanceBeingSent,
  }

  const edicts: ProtoruneEdict[] = [
    {
      id: new ProtoruneRuneId(
        u128(BigInt(token0.block)),
        u128(BigInt(token0.tx))
      ),
      amount: u128(token0Amount),
      output: u32(1),
    },
    {
      id: new ProtoruneRuneId(
        u128(BigInt(token1.block)),
        u128(BigInt(token1.tx))
      ),
      amount: u128(Number(token1Amount)),
      output: u32(1),
    }
  ]

  const protostone: Buffer = encodeRunestoneProtostone({
    protostones: [
      ProtoStone.message({
        protocolTag: 1n,
        pointer: 0,
        edicts,
        refundPointer: 0,
        calldata: encipher(calldata),
      }),
    ],
  }).encodedRunestone

  return await alkanes.execute({
    alkaneUtxos: tokenUtxos,
    protostone,
    gatheredUtxos,
    feeRate,
    account,
    signer,
    provider,
  })
}

export const splitAlkaneUtxos = async (
  tokens: { alkaneId: AlkaneId, amount: bigint }[],
  gatheredUtxos: { utxos: Utxo[]; totalAmount: number },
  feeRate: number,
  account: Account,
  signer: Signer,
  provider: Provider
) => {
  let tokenUtxos: {
    alkaneUtxos: any[]
    totalSatoshis: number
  }

  const [allTokenUtxos] = await Promise.all(
    tokens.map(async (token) => {
      return findAlkaneUtxos({
        address: account.taproot.address,
        greatestToLeast: false,
        provider,
        targetNumberOfAlkanes: Number(token.amount),
        alkaneId: token.alkaneId,
      })
    })
  )


  tokenUtxos = {
    alkaneUtxos: allTokenUtxos.alkaneUtxos,
    totalSatoshis: allTokenUtxos.totalSatoshis
  }
  const edicts: ProtoruneEdict[] = tokens.flatMap((token, index) => {
    return [
      {
        id: new ProtoruneRuneId(
          u128(BigInt(token.alkaneId.block)),
          u128(BigInt(token.alkaneId.tx))
        ),
        amount: u128(token.amount),
        output: u32(index),
      },
      {
        id: new ProtoruneRuneId(
          u128(BigInt(token.alkaneId.block)),
          u128(BigInt(token.alkaneId.tx))
        ),
        amount: u128(tokenUtxos.alkaneUtxos.filter((utxo) => 
          utxo.id.block === token.alkaneId.block 
          && utxo.id.tx === token.alkaneId.tx).reduce((acc, utxo) => 
          acc + Number(utxo.amountOfAlkanes), 0) - Number(token.amount)),
        output: u32(index + 1),
      },
    ]
  }
  )



  const protostone: Buffer = encodeRunestoneProtostone({
    protostones: [
      ProtoStone.edicts({
        protocolTag: 1n,
        edicts,
      }),
    ],
  }).encodedRunestone

  return await alkanes.token.split({
    alkaneUtxos: tokenUtxos,
    protostone,
    gatheredUtxos,
    feeRate,
    account,
    signer,
    provider,
  })
}
