"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitAlkaneUtxos = exports.createNewPool = exports.getPoolId = exports.AlkanesPoolFactoryDecoder = exports.PoolFactoryOpcodes = void 0;
const alkanes_1 = require("../alkanes/alkanes");
const u128_1 = require("@magiceden-oss/runestone-lib/dist/src/integer/u128");
const u32_1 = require("@magiceden-oss/runestone-lib/dist/src/integer/u32");
const bytes_1 = require("alkanes/lib/bytes");
const proto_runestone_upgrade_1 = require("alkanes/lib/protorune/proto_runestone_upgrade");
const protoruneruneid_1 = require("alkanes/lib/protorune/protoruneruneid");
const protostone_1 = require("alkanes/lib/protorune/protostone");
const __1 = require("..");
const BURN_OUTPUT = (0, u32_1.u32)(2);
var PoolFactoryOpcodes;
(function (PoolFactoryOpcodes) {
    PoolFactoryOpcodes[PoolFactoryOpcodes["INIT_POOL"] = 0] = "INIT_POOL";
    PoolFactoryOpcodes[PoolFactoryOpcodes["CREATE_NEW_POOL"] = 1] = "CREATE_NEW_POOL";
    PoolFactoryOpcodes[PoolFactoryOpcodes["FIND_EXISTING_POOL_ID"] = 2] = "FIND_EXISTING_POOL_ID";
})(PoolFactoryOpcodes = exports.PoolFactoryOpcodes || (exports.PoolFactoryOpcodes = {}));
class AlkanesPoolFactoryDecoder {
    static decodeInitPoolFactory(execution) {
        if (!execution.alkanes?.[0])
            return undefined;
        return {
            poolId: BigInt(execution.alkanes[0].u[1][0]),
        };
    }
    static decodeCreateNewPool(data) {
        if (data === '0x')
            return undefined;
        // Convert hex to BigInt (little-endian)
        const bytes = Buffer.from(data.slice(2), 'hex');
        const reversed = Buffer.from([...bytes].reverse());
        return {
            poolId: BigInt('0x' + reversed.toString('hex'))
        };
    }
    static decodeFindExistingPoolId(execution) {
        if (!execution.alkanes?.[0] || !execution.alkanes?.[1])
            return undefined;
        return {
            poolId: BigInt(execution.alkanes[0].u[1][0]),
        };
    }
    static decodeSimulation(result, opcode) {
        if (result.status !== 0 || result.execution.error) {
            return {
                success: false,
                error: result.execution.error || 'Unknown error',
                gasUsed: result.gasUsed
            };
        }
        let decoded;
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
exports.AlkanesPoolFactoryDecoder = AlkanesPoolFactoryDecoder;
const getPoolId = async () => { };
exports.getPoolId = getPoolId;
const createNewPool = async (calldata, token0, token0Amount, token1, token1Amount, gatheredUtxos, feeRate, account, signer, provider) => {
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
            id: new protoruneruneid_1.ProtoruneRuneId((0, u128_1.u128)(BigInt(token0.block)), (0, u128_1.u128)(BigInt(token0.tx))),
            amount: (0, u128_1.u128)(token0Amount),
            output: (0, u32_1.u32)(1),
        },
        {
            id: new protoruneruneid_1.ProtoruneRuneId((0, u128_1.u128)(BigInt(token1.block)), (0, u128_1.u128)(BigInt(token1.tx))),
            amount: (0, u128_1.u128)(Number(token1Amount)),
            output: (0, u32_1.u32)(1),
        }
    ];
    const protostone = (0, proto_runestone_upgrade_1.encodeRunestoneProtostone)({
        protostones: [
            protostone_1.ProtoStone.message({
                protocolTag: 1n,
                pointer: 0,
                edicts,
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
exports.createNewPool = createNewPool;
const splitAlkaneUtxos = async (tokens, gatheredUtxos, feeRate, account, signer, provider) => {
    let tokenUtxos;
    const [allTokenUtxos] = await Promise.all(tokens.map(async (token) => {
        return (0, alkanes_1.findAlkaneUtxos)({
            address: account.taproot.address,
            greatestToLeast: false,
            provider,
            targetNumberOfAlkanes: Number(token.amount),
            alkaneId: token.alkaneId,
        });
    }));
    tokenUtxos = {
        alkaneUtxos: allTokenUtxos.alkaneUtxos,
        totalSatoshis: allTokenUtxos.totalSatoshis
    };
    const edicts = tokens.flatMap((token, index) => {
        return [
            {
                id: new protoruneruneid_1.ProtoruneRuneId((0, u128_1.u128)(BigInt(token.alkaneId.block)), (0, u128_1.u128)(BigInt(token.alkaneId.tx))),
                amount: (0, u128_1.u128)(token.amount),
                output: (0, u32_1.u32)(index),
            },
            {
                id: new protoruneruneid_1.ProtoruneRuneId((0, u128_1.u128)(BigInt(token.alkaneId.block)), (0, u128_1.u128)(BigInt(token.alkaneId.tx))),
                amount: (0, u128_1.u128)(tokenUtxos.alkaneUtxos.filter((utxo) => utxo.id.block === token.alkaneId.block
                    && utxo.id.tx === token.alkaneId.tx).reduce((acc, utxo) => acc + Number(utxo.amountOfAlkanes), 0) - Number(token.amount)),
                output: (0, u32_1.u32)(index + 1),
            },
        ];
    });
    const protostone = (0, proto_runestone_upgrade_1.encodeRunestoneProtostone)({
        protostones: [
            protostone_1.ProtoStone.edicts({
                protocolTag: 1n,
                edicts,
            }),
        ],
    }).encodedRunestone;
    return await __1.alkanes.token.split({
        alkaneUtxos: tokenUtxos,
        protostone,
        gatheredUtxos,
        feeRate,
        account,
        signer,
        provider,
    });
};
exports.splitAlkaneUtxos = splitAlkaneUtxos;
//# sourceMappingURL=factory.js.map