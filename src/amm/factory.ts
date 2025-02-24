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

export type InitPoolFactorySimulationResult = {
  poolId: bigint;
};

export type CreateNewPoolSimulationResult = {
  poolId: bigint;
};

export type FindExistingPoolIdSimulationResult = {
  poolId: bigint;
};

export enum PoolFactoryOpcodes {
  INIT_POOL = 0,
  CREATE_NEW_POOL = 1,
  FIND_EXISTING_POOL_ID = 2,
}

export class AlkanesPoolFactoryDecoder {
  private static decodeInitPoolFactory(execution: any): InitPoolFactorySimulationResult | undefined {
    if (!execution.alkanes?.[0]) return undefined;
    return {
      poolId: BigInt(execution.alkanes[0].u[1][0]),
    };
  }

  private static decodeCreateNewPool(data: string): CreateNewPoolSimulationResult | undefined {
    if (data === '0x') return undefined;
    // Convert hex to BigInt (little-endian)
    const bytes = Buffer.from(data.slice(2), 'hex');
    const reversed = Buffer.from([...bytes].reverse());
    return {
      poolId: BigInt('0x' + reversed.toString('hex'))
    };
  }

  private static decodeFindExistingPoolId(execution: any): FindExistingPoolIdSimulationResult | undefined {
    if (!execution.alkanes?.[0] || !execution.alkanes?.[1]) return undefined;
    return {
      poolId: BigInt(execution.alkanes[0].u[1][0]),
    };
  }

  static decodeSimulation(result: any, opcode: number) {
    if (result.status !== 0 || result.execution.error) {
      return {
        success: false,
        error: result.execution.error || 'Unknown error',
        gasUsed: result.gasUsed
      };
    }

    let decoded: any;
    switch (opcode) {
      case PoolFactoryOpcodes.INIT_POOL:
        decoded = this.decodeInitPoolFactory(result.execution);
        break;
      case PoolFactoryOpcodes.CREATE_NEW_POOL:
        decoded = this.decodeCreateNewPool(result.execution);
        break;
      case PoolFactoryOpcodes.FIND_EXISTING_POOL_ID:
        decoded = this.decodeFindExistingPoolId(result.execution);
        break;
      default:
        decoded = undefined;
    }

    return decoded;
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
