"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolId = exports.swap = exports.burn = exports.mint = exports.AlkanesPoolSimulateDecoder = exports.PoolOpcodes = void 0;
const bytes_1 = require("alkanes/lib/bytes");
const proto_runestone_upgrade_1 = require("alkanes/lib/protorune/proto_runestone_upgrade");
const protostone_1 = require("alkanes/lib/protorune/protostone");
const __1 = require("..");
const alkanes_1 = require("../alkanes");
const integer_1 = require("@magiceden-oss/runestone-lib/dist/src/integer");
const protoruneruneid_1 = require("alkanes/lib/protorune/protoruneruneid");
var PoolOpcodes;
(function (PoolOpcodes) {
    PoolOpcodes[PoolOpcodes["INIT_POOL"] = 0] = "INIT_POOL";
    PoolOpcodes[PoolOpcodes["ADD_LIQUIDITY"] = 1] = "ADD_LIQUIDITY";
    PoolOpcodes[PoolOpcodes["REMOVE_LIQUIDITY"] = 2] = "REMOVE_LIQUIDITY";
    PoolOpcodes[PoolOpcodes["SWAP"] = 3] = "SWAP";
    PoolOpcodes[PoolOpcodes["SIMULATE_SWAP"] = 4] = "SIMULATE_SWAP";
})(PoolOpcodes = exports.PoolOpcodes || (exports.PoolOpcodes = {}));
class AlkanesPoolSimulateDecoder {
    static decodeAddLiquidity(execution) {
        if (!execution.alkanes?.[0])
            return undefined;
        return {
            lpTokens: BigInt(execution.alkanes[0].u[1][0]),
            lpTokenId: {
                block: BigInt(execution.alkanes[0].u[0][0][0]),
                tx: BigInt(execution.alkanes[0].u[0][1][0])
            }
        };
    }
    static decodeSwap(data) {
        if (data === '0x')
            return undefined;
        // Convert hex to BigInt (little-endian)
        const bytes = Buffer.from(data.slice(2), 'hex');
        const reversed = Buffer.from([...bytes].reverse());
        return {
            amountOut: BigInt('0x' + reversed.toString('hex'))
        };
    }
    static decodeRemoveLiquidity(execution) {
        if (!execution.alkanes?.[0] || !execution.alkanes?.[1])
            return undefined;
        return {
            token0Amount: BigInt(execution.alkanes[0].u[1][0]),
            token1Amount: BigInt(execution.alkanes[1].u[1][0])
        };
    }
    static decodeSimulation(result, opcodeType) {
        if (result.status !== 0 || result.execution.error) {
            return {
                success: false,
                error: result.execution.error || 'Unknown error',
                gasUsed: result.gasUsed
            };
        }
        let decoded;
        switch (opcodeType) {
            case PoolOpcodes.INIT_POOL:
            case PoolOpcodes.ADD_LIQUIDITY:
                decoded = this.decodeAddLiquidity(result.execution);
                break;
            case PoolOpcodes.SIMULATE_SWAP:
                decoded = this.decodeSwap(result.execution.data);
                break;
            case PoolOpcodes.REMOVE_LIQUIDITY:
                decoded = this.decodeRemoveLiquidity(result.execution);
                break;
            default:
                decoded = undefined;
        }
        return {
            success: true,
            gasUsed: result.gasUsed,
            decoded,
            raw: result
        };
    }
}
exports.AlkanesPoolSimulateDecoder = AlkanesPoolSimulateDecoder;
const mint = async (calldata, token0, token0Amount, token1, token1Amount, gatheredUtxos, feeRate, account, signer, provider) => {
    let tokenUtxos;
    const [token0Utxos, token1Utxos] = await Promise.all([
        (0, alkanes_1.findAlkaneUtxos)({
            address: account.taproot.address,
            greatestToLeast: false,
            provider,
            targetNumberOfAlkanes: Number(token0Amount),
            alkaneId: token0,
        }),
        (0, alkanes_1.findAlkaneUtxos)({
            address: account.taproot.address,
            greatestToLeast: false,
            provider,
            targetNumberOfAlkanes: Number(token1Amount),
            alkaneId: token1,
        }),
    ]);
    tokenUtxos = {
        alkaneUtxos: [...token0Utxos.alkaneUtxos, ...token1Utxos.alkaneUtxos],
        totalSatoshis: token0Utxos.totalSatoshis + token1Utxos.totalSatoshis,
        totalSentToken0: token0Utxos.totalBalanceBeingSent,
        totalSentToken1: token1Utxos.totalBalanceBeingSent,
    };
    const edicts = [
        {
            id: new protoruneruneid_1.ProtoruneRuneId((0, integer_1.u128)(BigInt(token0.block)), (0, integer_1.u128)(BigInt(token0.tx))),
            amount: (0, integer_1.u128)(token0Amount),
            output: (0, integer_1.u32)(1),
        },
        {
            id: new protoruneruneid_1.ProtoruneRuneId((0, integer_1.u128)(BigInt(token1.block)), (0, integer_1.u128)(BigInt(token1.tx))),
            amount: (0, integer_1.u128)(Number(token1Amount)),
            output: (0, integer_1.u32)(1),
        }
    ];
    const protostone = (0, proto_runestone_upgrade_1.encodeRunestoneProtostone)({
        protostones: [
            protostone_1.ProtoStone.message({
                protocolTag: 1n,
                edicts,
                pointer: 0,
                refundPointer: 0,
                calldata: (0, bytes_1.encipher)(calldata),
            }),
        ],
    }).encodedRunestone;
    return await __1.alkanes.execute({
        alkaneUtxos: tokenUtxos,
        protostone,
        gatheredUtxos,
        feeRate,
        account,
        signer,
        provider,
    });
};
exports.mint = mint;
const burn = async (calldata, token, tokenAmount, gatheredUtxos, feeRate, account, signer, provider) => {
    let alkaneTokenUtxos;
    const [tokenUtxos] = await Promise.all([
        (0, alkanes_1.findAlkaneUtxos)({
            address: account.taproot.address,
            greatestToLeast: false,
            provider,
            targetNumberOfAlkanes: Number(tokenAmount),
            alkaneId: token,
        })
    ]);
    alkaneTokenUtxos = {
        alkaneUtxos: [...tokenUtxos.alkaneUtxos],
        totalSatoshis: tokenUtxos.totalSatoshis,
    };
    const edicts = [
        {
            id: new protoruneruneid_1.ProtoruneRuneId((0, integer_1.u128)(BigInt(token.block)), (0, integer_1.u128)(BigInt(token.tx))),
            amount: (0, integer_1.u128)(tokenAmount),
            output: (0, integer_1.u32)(1),
        }
    ];
    const protostone = (0, proto_runestone_upgrade_1.encodeRunestoneProtostone)({
        protostones: [
            protostone_1.ProtoStone.message({
                protocolTag: 1n,
                edicts,
                pointer: 0,
                refundPointer: 0,
                calldata: (0, bytes_1.encipher)(calldata),
            }),
        ],
    }).encodedRunestone;
    return await __1.alkanes.execute({
        alkaneUtxos: alkaneTokenUtxos,
        protostone,
        gatheredUtxos,
        feeRate,
        account,
        signer,
        provider,
    });
};
exports.burn = burn;
const swap = async (calldata, token, tokenAmount, gatheredUtxos, feeRate, account, signer, provider) => {
    let alkaneTokenUtxos;
    const [tokenUtxos] = await Promise.all([
        (0, alkanes_1.findAlkaneUtxos)({
            address: account.taproot.address,
            greatestToLeast: false,
            provider,
            targetNumberOfAlkanes: Number(tokenAmount),
            alkaneId: token,
        })
    ]);
    alkaneTokenUtxos = {
        alkaneUtxos: [...tokenUtxos.alkaneUtxos],
        totalSatoshis: tokenUtxos.totalSatoshis,
    };
    const edicts = [
        {
            id: new protoruneruneid_1.ProtoruneRuneId((0, integer_1.u128)(BigInt(token.block)), (0, integer_1.u128)(BigInt(token.tx))),
            amount: (0, integer_1.u128)(tokenAmount),
            output: (0, integer_1.u32)(1),
        }
    ];
    const protostone = (0, proto_runestone_upgrade_1.encodeRunestoneProtostone)({
        protostones: [
            protostone_1.ProtoStone.message({
                protocolTag: 1n,
                edicts,
                pointer: 0,
                refundPointer: 0,
                calldata: (0, bytes_1.encipher)(calldata),
            }),
        ],
    }).encodedRunestone;
    return await __1.alkanes.execute({
        alkaneUtxos: alkaneTokenUtxos,
        protostone,
        gatheredUtxos,
        feeRate,
        account,
        signer,
        provider,
    });
};
exports.swap = swap;
const getPoolId = async () => { };
exports.getPoolId = getPoolId;
//# sourceMappingURL=pool.js.map