import { encipher } from 'alkanes/lib/bytes'
import { encodeRunestoneProtostone } from 'alkanes/lib/protorune/proto_runestone_upgrade'
import { ProtoStone } from 'alkanes/lib/protorune/protostone'
import { Account, alkanes, Provider, Signer, utxo } from '..'
import { findAlkaneUtxos } from '../alkanes'
import { AlkaneId, Utxo } from 'shared/interface'
import { u128, u32 } from '@magiceden-oss/runestone-lib/dist/src/integer'
import { ProtoruneEdict } from 'alkanes/lib/protorune/protoruneedict'
import { ProtoruneRuneId } from 'alkanes/lib/protorune/protoruneruneid'

export type SwapSimulationResult = {
  amountOut: bigint;
};

export type PoolDetailsResult = {
  token0: AlkaneId;
  token1: AlkaneId;
  token0Amount: string;
  token1Amount: string;
  tokenSupply: string;
};

export enum PoolOpcodes {
  INIT_POOL = 0,
  ADD_LIQUIDITY = 1,
  REMOVE_LIQUIDITY = 2,
  SWAP = 3,
  SIMULATE_SWAP = 4,
  POOL_DETAILS = 5,
}

export class AlkanesAMMPoolDecoder {
  decodeSwap(data: string): SwapSimulationResult | undefined {
    if (data === '0x') return undefined;
    // Convert hex to BigInt (little-endian)
    const bytes = Buffer.from(data.slice(2), 'hex');
    const reversed = Buffer.from([...bytes].reverse());
    return {
      amountOut: BigInt('0x' + reversed.toString('hex'))
    };
  }

  decodePoolDetails(data: string): PoolDetailsResult | undefined {
    if (data === '0x') return undefined;
    const bytes = Buffer.from(data.slice(2), 'hex');
    
    const token0: AlkaneId = {
      block: bytes.readBigUInt64LE(0).toString(),
      tx: bytes.readBigUInt64LE(16).toString()
    };
    const token1: AlkaneId = {
      block: bytes.readBigUInt64LE(32).toString(),
      tx: bytes.readBigUInt64LE(48).toString()
    };
    
    const token0Amount = bytes.readBigUInt64LE(64).toString();
    const token1Amount = bytes.readBigUInt64LE(80).toString();
    const tokenSupply = bytes.readBigUInt64LE(96).toString();

    return { token0, token1, token0Amount, token1Amount, tokenSupply };
  }

  static decodeSimulation(result: any, opcode: number) {

    const decoder = new AlkanesAMMPoolDecoder();
    let decoded: any;
    switch (opcode) {
      case PoolOpcodes.INIT_POOL:
      case PoolOpcodes.ADD_LIQUIDITY:
      case PoolOpcodes.REMOVE_LIQUIDITY:
        throw new Error('Opcode not supported in simulation mode');
      case PoolOpcodes.SIMULATE_SWAP:
        decoded = decoder.decodeSwap(result.execution.data);
        break;
      case PoolOpcodes.POOL_DETAILS:
        decoded = decoder.decodePoolDetails(result.execution.data);
        break;
      default:
        decoded = undefined;
    }

    if (result.status !== 0 || result.execution.error) {
      throw new Error(result.execution.error || 'Unknown error');
    }

    return decoded;
  }
}

export const mint = async (
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
        edicts,
        pointer: 0,
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

export const burn = async (
  calldata: bigint[],
  token: AlkaneId,
  tokenAmount: bigint,
  gatheredUtxos: { utxos: Utxo[]; totalAmount: number },
  feeRate: number,
  account: Account,
  signer: Signer,
  provider: Provider
) => {
  let alkaneTokenUtxos: {
    alkaneUtxos: any[]
    totalSatoshis: number
  }

  const [tokenUtxos] = await Promise.all([
    findAlkaneUtxos({
      address: account.taproot.address,
      greatestToLeast: false,
      provider,
      targetNumberOfAlkanes: Number(tokenAmount),
      alkaneId: token,
    })
  ])

  alkaneTokenUtxos = {
    alkaneUtxos: [...tokenUtxos.alkaneUtxos],
    totalSatoshis: tokenUtxos.totalSatoshis,
  }
  const edicts: ProtoruneEdict[] = [
    {
      id: new ProtoruneRuneId(
        u128(BigInt(token.block)),
        u128(BigInt(token.tx))
      ),
      amount: u128(tokenAmount),
      output: u32(1),
    }
  ]


  const protostone: Buffer = encodeRunestoneProtostone({
    protostones: [
      ProtoStone.message({
        protocolTag: 1n,
        edicts,
        pointer: 0,
        refundPointer: 0,
        calldata: encipher(calldata),
      }),
    ],
  }).encodedRunestone

  return await alkanes.execute({
    alkaneUtxos: alkaneTokenUtxos,
    protostone,
    gatheredUtxos,
    feeRate,
    account,
    signer,
    provider,
  })
}


export const swap = async (
  calldata: bigint[],
  token: AlkaneId,
  tokenAmount: bigint,
  gatheredUtxos: { utxos: Utxo[]; totalAmount: number },
  feeRate: number,
  account: Account,
  signer: Signer,
  provider: Provider
) => {
  let alkaneTokenUtxos: {
    alkaneUtxos: any[]
    totalSatoshis: number
  }

  const [tokenUtxos] = await Promise.all([
    findAlkaneUtxos({
      address: account.taproot.address,
      greatestToLeast: false,
      provider,
      targetNumberOfAlkanes: Number(tokenAmount),
      alkaneId: token,
    })
  ])

  alkaneTokenUtxos = {
    alkaneUtxos: [...tokenUtxos.alkaneUtxos],
    totalSatoshis: tokenUtxos.totalSatoshis,
  }
  const edicts: ProtoruneEdict[] = [
    {
      id: new ProtoruneRuneId(
        u128(BigInt(token.block)),
        u128(BigInt(token.tx))
      ),
      amount: u128(tokenAmount),
      output: u32(1),
    }
  ]


  const protostone: Buffer = encodeRunestoneProtostone({
    protostones: [
      ProtoStone.message({
        protocolTag: 1n,
        edicts,
        pointer: 0,
        refundPointer: 0,
        calldata: encipher(calldata),
      }),
    ],
  }).encodedRunestone

  return await alkanes.execute({
    alkaneUtxos: alkaneTokenUtxos,
    protostone,
    gatheredUtxos,
    feeRate,
    account,
    signer,
    provider,
  })
}

export const getPoolId = async () => {}
