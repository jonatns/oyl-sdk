import { encipher } from 'alkanes/lib/bytes'
import { encodeRunestoneProtostone } from 'alkanes/lib/protorune/proto_runestone_upgrade'
import { ProtoStone } from 'alkanes/lib/protorune/protostone'
import { Account, alkanes, Provider, Signer, utxo } from '..'
import { findAlkaneUtxos } from '../alkanes'
import { AlkaneId, Utxo } from 'shared/interface'
import { u128, u32 } from '@magiceden-oss/runestone-lib/dist/src/integer'
import { ProtoruneEdict } from 'alkanes/lib/protorune/protoruneedict'
import { ProtoruneRuneId } from 'alkanes/lib/protorune/protoruneruneid'

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
      greatestToLeast: true,
      provider,
      targetNumberOfAlkanes: Number(token0Amount),
      alkaneId: token0,
    }),
    findAlkaneUtxos({
      address: account.taproot.address,
      greatestToLeast: true,
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
      amount: u128(tokenUtxos.totalSentToken0 - Number(token0Amount)),
      output: u32(0),
    },
    {
      id: new ProtoruneRuneId(
        u128(BigInt(token0.block)),
        u128(BigInt(token0.tx))
      ),
      amount: u128(token0Amount),
      output: u32(2),
    },
    {
      id: new ProtoruneRuneId(
        u128(BigInt(token1.block)),
        u128(BigInt(token1.tx))
      ),
      amount: u128(tokenUtxos.totalSentToken1 - Number(token1Amount)),
      output: u32(1),
    },
    {
      id: new ProtoruneRuneId(
        u128(BigInt(token1.block)),
        u128(BigInt(token1.tx))
      ),
      amount: u128(token1Amount),
      output: u32(2),
    },
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
        pointer: 1,
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


export const swap = async () => {}

export const getPoolId = async () => {}
