import * as ecc from "@bitcoinerlab/secp256k1"
import * as bitcoin from "bitcoinjs-lib"
import { WitnessScriptOptions } from "../shared/interface"
import { maximumScriptBytes } from "../shared/constants"
import { getWitnessDataChunk } from "../shared/utils"


export function witnessScriptBuilder(options: WitnessScriptOptions) {
    bitcoin.initEccLib(ecc)
    if (!options.mediaType || !options.mediaContent || !options.pubKeyHex) {
        throw new Error("Missing required parameters to build witness script. mediaType, mediaContent & pubkeyHex are required")
    }

    if (options?.recover) {
        return bitcoin.script.compile([Buffer.from(options.pubKeyHex, "hex"), bitcoin.opcodes.OP_CHECKSIG])
    }

    const encoding = !options.mediaType.includes("text") ? "base64" : "utf8"
    const chunkedWitnessData = getWitnessDataChunk(options.mediaContent, encoding)
    const stack = chunkedWitnessData.map(pushOp)
    const metaStack: (number | Buffer)[] = []

    if (typeof options.meta === "object") {
        metaStack.push(
            ...[
                bitcoin.opcodes.OP_FALSE,
                bitcoin.opcodes.OP_IF,
                pushOp("ord"),
                1,
                1,
                pushOp("application/json;charset=utf-8"),
                bitcoin.opcodes.OP_0
            ]
        )
        const metaChunks = getWitnessDataChunk(JSON.stringify(options.meta))

        metaChunks &&
            metaChunks.forEach((chunk) => {
                metaStack.push(pushOp(chunk))
            })
        metaChunks && metaStack.push(bitcoin.opcodes.OP_ENDIF)
    }

    const firstStack = [
        Buffer.from(options.pubKeyHex, "hex"),
        bitcoin.opcodes.OP_CHECKSIG,
        bitcoin.opcodes.OP_FALSE,
        bitcoin.opcodes.OP_IF,
        pushOp("ord"),
        1,
        1,
        pushOp(options.mediaType),
        bitcoin.opcodes.OP_0
    ]

    const witnessScript = bitcoin.script.compile([
        ...firstStack,
        ...stack,
        bitcoin.opcodes.OP_ENDIF,
        ...metaStack
    ])

    return witnessScript

}


function pushOp(data: string | Buffer) {
    if (Buffer.isBuffer(data)) {
        return processDataBytes(data)
    } else {
        const buffered = Buffer.from(data, "utf8")
        return processDataBytes(buffered)
    }
}

function processDataBytes(data) {
    if (data.byteLength > maximumScriptBytes) {
        throw new Error("Data above the maximum script bytes. Try splitting into smaller chunks first")
    }
    return Buffer.concat([data])
}