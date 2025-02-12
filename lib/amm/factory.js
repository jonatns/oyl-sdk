"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewPool = exports.getPoolId = void 0;
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
            greatestToLeast: true,
            provider,
            targetNumberOfAlkanes: Number(token0Amount),
            alkaneId: token0,
        }),
        (0, alkanes_1.findAlkaneUtxos)({
            address: account.taproot.address,
            greatestToLeast: true,
            provider,
            targetNumberOfAlkanes: Number(token1Amount),
            alkaneId: token1,
        }),
    ]);
    tokenUtxos = {
        alkaneUtxos: [...token0Utxos.alkaneUtxos, ...token1Utxos.alkaneUtxos],
        totalSatoshis: token0Utxos.totalSatoshis + token1Utxos.totalSatoshis,
    };
    const edicts = [
        {
            id: new protoruneruneid_1.ProtoruneRuneId((0, u128_1.u128)(BigInt(token0.block)), (0, u128_1.u128)(BigInt(token0.tx))),
            amount: (0, u128_1.u128)(token0Amount),
            output: (0, u32_1.u32)(0),
        },
        {
            id: new protoruneruneid_1.ProtoruneRuneId((0, u128_1.u128)(BigInt(token1.block)), (0, u128_1.u128)(BigInt(token1.tx))),
            amount: (0, u128_1.u128)(token1Amount),
            output: (0, u32_1.u32)(1),
        },
    ];
    const protostone = (0, proto_runestone_upgrade_1.encodeRunestoneProtostone)({
        protostones: [
            protostone_1.ProtoStone.message({
                protocolTag: 1n,
                edicts,
                pointer: Number(BURN_OUTPUT),
                refundPointer: 0,
                calldata: (0, bytes_1.encipher)(calldata),
            }),
        ],
    }).encodedRunestone;
    await __1.alkanes.execute({
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
//# sourceMappingURL=factory.js.map