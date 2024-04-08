"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.witnessScriptBuilder = void 0;
const ecc = __importStar(require("@bitcoinerlab/secp256k1"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const constants_1 = require("../shared/constants");
const utils_1 = require("../shared/utils");
function witnessScriptBuilder(options) {
    bitcoin.initEccLib(ecc);
    if (!options.mediaType || !options.mediaContent || !options.pubKeyHex) {
        throw new Error('Missing required parameters to build witness script. mediaType, mediaContent & pubkeyHex are required');
    }
    if (options?.recover) {
        return bitcoin.script.compile([
            Buffer.from(options.pubKeyHex, 'hex'),
            bitcoin.opcodes.OP_CHECKSIG,
        ]);
    }
    const encoding = !options.mediaType.includes('text') ? 'base64' : 'utf8';
    const chunkedWitnessData = (0, utils_1.getWitnessDataChunk)(options.mediaContent, encoding);
    const stack = chunkedWitnessData.map(pushOp);
    const metaStack = [];
    if (typeof options.meta === 'object') {
        metaStack.push(...[
            bitcoin.opcodes.OP_FALSE,
            bitcoin.opcodes.OP_IF,
            pushOp('ord'),
            1,
            1,
            pushOp('application/json;charset=utf-8'),
            bitcoin.opcodes.OP_0,
        ]);
        const metaChunks = (0, utils_1.getWitnessDataChunk)(JSON.stringify(options.meta));
        metaChunks &&
            metaChunks.forEach((chunk) => {
                metaStack.push(pushOp(chunk));
            });
        metaChunks && metaStack.push(bitcoin.opcodes.OP_ENDIF);
    }
    const firstStack = [
        Buffer.from(options.pubKeyHex, 'hex'),
        bitcoin.opcodes.OP_CHECKSIG,
        bitcoin.opcodes.OP_FALSE,
        bitcoin.opcodes.OP_IF,
        pushOp('ord'),
        1,
        1,
        pushOp(options.mediaType),
        bitcoin.opcodes.OP_0,
    ];
    const witnessScript = bitcoin.script.compile([
        ...firstStack,
        ...stack,
        bitcoin.opcodes.OP_ENDIF,
        ...metaStack,
    ]);
    return witnessScript;
}
exports.witnessScriptBuilder = witnessScriptBuilder;
function pushOp(data) {
    if (Buffer.isBuffer(data)) {
        return processDataBytes(data);
    }
    else {
        const buffered = Buffer.from(data, 'utf8');
        return processDataBytes(buffered);
    }
}
function processDataBytes(data) {
    if (data.byteLength > constants_1.maximumScriptBytes) {
        throw new Error('Data above the maximum script bytes. Try splitting into smaller chunks first');
    }
    return Buffer.concat([data]);
}
//# sourceMappingURL=witness.js.map