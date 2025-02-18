"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitAlkaneUtxos = exports.createNewPool = exports.getPoolId = void 0;
const alkanes_1 = require("../alkanes/alkanes");
const u128_1 = require("@magiceden-oss/runestone-lib/dist/src/integer/u128");
const u32_1 = require("@magiceden-oss/runestone-lib/dist/src/integer/u32");
const bytes_1 = require("alkanes/lib/bytes");
const proto_runestone_upgrade_1 = require("alkanes/lib/protorune/proto_runestone_upgrade");
const protoruneruneid_1 = require("alkanes/lib/protorune/protoruneruneid");
const protostone_1 = require("alkanes/lib/protorune/protostone");
const __1 = require("..");
const BURN_OUTPUT = (0, u32_1.u32)(2);
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