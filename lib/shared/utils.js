'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        var desc = Object.getOwnPropertyDescriptor(m, k)
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k]
            },
          }
        }
        Object.defineProperty(o, k2, desc)
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __asyncValues =
  (this && this.__asyncValues) ||
  function (o) {
    if (!Symbol.asyncIterator)
      throw new TypeError('Symbol.asyncIterator is not defined.')
    var m = o[Symbol.asyncIterator],
      i
    return m
      ? m.call(o)
      : ((o =
          typeof __values === 'function' ? __values(o) : o[Symbol.iterator]()),
        (i = {}),
        verb('next'),
        verb('throw'),
        verb('return'),
        (i[Symbol.asyncIterator] = function () {
          return this
        }),
        i)
    function verb(n) {
      i[n] =
        o[n] &&
        function (v) {
          return new Promise(function (resolve, reject) {
            ;(v = o[n](v)), settle(resolve, reject, v.done, v.value)
          })
        }
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function (v) {
        resolve({ value: v, done: d })
      }, reject)
    }
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.createBtcTx =
  exports.filterTaprootUtxos =
  exports.sendCollectible =
  exports.isP2TR =
  exports.isP2SHScript =
  exports.isP2WSHScript =
  exports.isP2WPKH =
  exports.isP2PKH =
  exports.getRawTxnHashFromTxnId =
  exports.calculateTaprootTxSize =
  exports.getOutputValueByVOutIndex =
  exports.waitForTransaction =
  exports.callBTCRPCEndpoint =
  exports.RPC_ADDR =
  exports.createInscriptionScript =
  exports.inscribe =
  exports.signInputs =
  exports.timeout =
  exports.formatOptionsToSignInputs =
  exports.calculateAmountGatheredUtxo =
  exports.calculateAmountGathered =
  exports.getInscriptionsByWalletBIS =
  exports.getSatpointFromUtxo =
  exports.getWitnessDataChunk =
  exports.utxoToInput =
  exports.validator =
  exports.amountToSatoshis =
  exports.delay =
  exports.satoshisToAmount =
  exports.tweakSigner =
  exports.checkPaymentType =
  exports.getNetwork =
  exports.assertHex =
  exports.ECPair =
    void 0
const bitcoin = __importStar(require('bitcoinjs-lib'))
const ecpair_1 = __importDefault(require('ecpair'))
const secp256k1_1 = __importDefault(require('@bitcoinerlab/secp256k1'))
bitcoin.initEccLib(secp256k1_1.default)
const interface_1 = require('../shared/interface')
const bignumber_js_1 = __importDefault(require('bignumber.js'))
const constants_1 = require('./constants')
const axios_1 = __importDefault(require('axios'))
const transactions_1 = require('../transactions')
const tapscript_1 = require('@cmdcode/tapscript')
const ecc2 = __importStar(require('@cmdcode/crypto-utils'))
const buildOrdTx_1 = require('../txbuilder/buildOrdTx')
const bip371_1 = require('bitcoinjs-lib/src/psbt/bip371')
const addressTypeMap = { 1: 'p2pkh', 2: 'p2sh', 3: 'p2wpkh', 4: 'p2tr' }
exports.ECPair = (0, ecpair_1.default)(secp256k1_1.default)
const assertHex = (pubKey) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)
exports.assertHex = assertHex
function tapTweakHash(pubKey, h) {
  return bitcoin.crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  )
}
function getNetwork(value) {
  if (value === 'mainnet' || value === 'main') {
    return bitcoin.networks['bitcoin']
  }
  return bitcoin.networks[value]
}
exports.getNetwork = getNetwork
function checkPaymentType(payment, network) {
  return (script) => {
    try {
      return payment({ output: script, network: getNetwork(network) })
    } catch (error) {
      return false
    }
  }
}
exports.checkPaymentType = checkPaymentType
function tweakSigner(signer, opts = {}) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey = signer.privateKey
  if (!privateKey) {
    throw new Error('Private key required')
  }
  if (signer.publicKey[0] === 3) {
    privateKey = secp256k1_1.default.privateNegate(privateKey)
  }
  const tweakedPrivateKey = secp256k1_1.default.privateAdd(
    privateKey,
    tapTweakHash((0, exports.assertHex)(signer.publicKey), opts.tweakHash)
  )
  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!')
  }
  return exports.ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  })
}
exports.tweakSigner = tweakSigner
function satoshisToAmount(val) {
  const num = new bignumber_js_1.default(val)
  return num.dividedBy(100000000).toFixed(8)
}
exports.satoshisToAmount = satoshisToAmount
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
exports.delay = delay
function amountToSatoshis(val) {
  const num = new bignumber_js_1.default(val)
  return num.multipliedBy(100000000).toNumber()
}
exports.amountToSatoshis = amountToSatoshis
const validator = (pubkey, msghash, signature) =>
  exports.ECPair.fromPublicKey(pubkey).verify(msghash, signature)
exports.validator = validator
function utxoToInput(utxo, publicKey) {
  let data
  switch (utxo.addressType) {
    case interface_1.AddressType.P2TR:
      data = {
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
        tapInternalKey: (0, exports.assertHex)(publicKey),
      }
      return {
        data,
        utxo,
      }
    case interface_1.AddressType.P2WPKH:
      data = {
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
      }
      return {
        data,
        utxo,
      }
    case interface_1.AddressType.P2PKH:
      data = {
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
      }
      return {
        data,
        utxo,
      }
    case interface_1.AddressType.P2SH_P2WPKH:
      const redeemData = bitcoin.payments.p2wpkh({ pubkey: publicKey })
      data = {
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          value: utxo.satoshis,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
        redeemScript: redeemData.output,
      }
      return {
        data,
        utxo,
      }
    default:
      data = {
        hash: '',
        index: 0,
        witnessUtxo: {
          value: 0,
          script: Buffer.from(utxo.scriptPk, 'hex'),
        },
      }
      return {
        data,
        utxo,
      }
  }
}
exports.utxoToInput = utxoToInput
const getWitnessDataChunk = function (content, encodeType = 'utf8') {
  const buffered = Buffer.from(content, encodeType)
  const contentChunks = []
  let chunks = 0
  while (chunks < buffered.byteLength) {
    const split = buffered.subarray(
      chunks,
      chunks + constants_1.maximumScriptBytes
    )
    chunks += split.byteLength
    contentChunks.push(split)
  }
  return contentChunks
}
exports.getWitnessDataChunk = getWitnessDataChunk
const getSatpointFromUtxo = (utxo) => {
  return `${utxo.tx_hash_big_endian}:${utxo.tx_output_n}:0`
}
exports.getSatpointFromUtxo = getSatpointFromUtxo
const getInscriptionsByWalletBIS = (walletAddress, offset = 0) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield axios_1.default
      .get(
        `https://api.bestinslot.xyz/v3/wallet/inscriptions?address=${walletAddress}&sort_by=inscr_num&order=asc&offset=${offset}&count=100`,
        {
          headers: {
            'X-Api-Key': 'abbfff3d-49fa-4f7f-883a-0a5fce48a9f1',
          },
        }
      )
      .then((res) => {
        var _a
        return (_a = res.data) === null || _a === void 0 ? void 0 : _a.data
      })
  })
exports.getInscriptionsByWalletBIS = getInscriptionsByWalletBIS
function calculateAmountGathered(utxoArray) {
  return utxoArray === null || utxoArray === void 0
    ? void 0
    : utxoArray.reduce((prev, currentValue) => prev + currentValue.value, 0)
}
exports.calculateAmountGathered = calculateAmountGathered
function calculateAmountGatheredUtxo(utxoArray) {
  return utxoArray === null || utxoArray === void 0
    ? void 0
    : utxoArray.reduce((prev, currentValue) => prev + currentValue.satoshis, 0)
}
exports.calculateAmountGatheredUtxo = calculateAmountGatheredUtxo
const formatOptionsToSignInputs = ({
  _psbt,
  pubkey,
  segwitPubkey,
  segwitAddress,
  taprootAddress,
  network,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c
    var _d, _e
    let toSignInputs = []
    const psbtNetwork = network
    try {
      let index = 0
      try {
        for (
          var _f = true, _g = __asyncValues(_psbt.data.inputs), _h;
          (_h = yield _g.next()), (_a = _h.done), !_a;

        ) {
          _c = _h.value
          _f = false
          try {
            const v = _c
            let script = null
            let value = 0
            const isSigned = v.finalScriptSig || v.finalScriptWitness
            const lostInternalPubkey = !v.tapInternalKey
            if (v.witnessUtxo) {
              script = v.witnessUtxo.script
              value = v.witnessUtxo.value
            } else if (v.nonWitnessUtxo) {
              const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo)
              const output = tx.outs[_psbt.txInputs[index].index]
              script = output.script
              value = output.value
            }
            if (!isSigned && lostInternalPubkey) {
              const tapInternalKey = (0, exports.assertHex)(
                Buffer.from(pubkey, 'hex')
              )
              const p2tr = bitcoin.payments.p2tr({
                internalPubkey: tapInternalKey,
                network: psbtNetwork,
              })
              if (
                ((_d = v.witnessUtxo) === null || _d === void 0
                  ? void 0
                  : _d.script.toString('hex')) ==
                ((_e = p2tr.output) === null || _e === void 0
                  ? void 0
                  : _e.toString('hex'))
              ) {
                v.tapInternalKey = tapInternalKey
              }
              if (v.tapInternalKey) {
                toSignInputs.push({
                  index: index,
                  publicKey: pubkey,
                  sighashTypes: v.sighashType ? [v.sighashType] : undefined,
                })
              }
            }
            if (script && !isSigned && !(0, bip371_1.isTaprootInput)(v)) {
              toSignInputs.push({
                index: index,
                publicKey: segwitPubkey,
                sighashTypes: v.sighashType ? [v.sighashType] : undefined,
              })
            }
            index++
          } finally {
            _f = true
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 }
      } finally {
        try {
          if (!_f && !_a && (_b = _g.return)) yield _b.call(_g)
        } finally {
          if (e_1) throw e_1.error
        }
      }
      return toSignInputs
    } catch (error) {
      console.log(error)
    }
  })
exports.formatOptionsToSignInputs = formatOptionsToSignInputs
const timeout = (n) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return yield new Promise((resolve) => setTimeout(resolve, n))
  })
exports.timeout = timeout
const signInputs = (
  psbt,
  toSignInputs,
  taprootPubkey,
  segwitPubKey,
  segwitSigner,
  taprootSigner
) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const taprootInputs = []
      const segwitInputs = []
      toSignInputs.forEach(({ index, publicKey }) => {
        if (publicKey === taprootPubkey) {
          taprootInputs.push(toSignInputs[index])
        }
        if (segwitPubKey && segwitSigner) {
          if (publicKey === segwitPubKey) {
            segwitInputs.push(toSignInputs[index])
          }
        }
      })
      if (taprootInputs.length > 0) {
        yield taprootSigner(psbt, taprootInputs)
      }
      if (segwitSigner && segwitInputs.length > 0) {
        yield segwitSigner(psbt, segwitInputs)
      }
      return psbt
    } catch (error) {
      console.log(error)
    }
  })
exports.signInputs = signInputs
const inscribe = ({
  ticker,
  amount,
  inputAddress,
  outputAddress,
  mnemonic,
  taprootPublicKey,
  segwitPublicKey,
  segwitAddress,
  isDry,
  segwitSigner,
  taprootSigner,
  payFeesWithSegwit = true,
  feeRate,
  network,
  segwitUtxos,
  taprootUtxos,
  taprootPrivateKey,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _j, e_2, _k, _l
    var _m
    try {
      const commitTxSize = calculateTaprootTxSize(3, 0, 2)
      const feeForCommit =
        commitTxSize * feeRate < 150 ? 200 : commitTxSize * feeRate
      const revealTxSize = calculateTaprootTxSize(1, 0, 1)
      const feeForReveal = revealTxSize * feeRate + 546 + 151
      const sendTxSize = calculateTaprootTxSize(3, 0, 2)
      const feeForSend = sendTxSize * feeRate
      const amountNeededForBrc20Send = feeForCommit + feeForReveal + feeForSend
      const utxosToSend = (0, buildOrdTx_1.findUtxosToCoverAmount)(
        taprootUtxos,
        amountNeededForBrc20Send
      )
      if (
        !utxosToSend ||
        !utxosToSend.selectedUtxos ||
        ((_m =
          utxosToSend === null || utxosToSend === void 0
            ? void 0
            : utxosToSend.selectedUtxos) === null || _m === void 0
          ? void 0
          : _m.length) === 0
      ) {
        return new Error('insufficient balance')
      }
      const amountGathered = calculateAmountGatheredUtxo(
        utxosToSend.selectedUtxos
      )
      const secret = taprootPrivateKey
      const secKey = ecc2.keys.get_seckey(String(secret))
      const pubKey = ecc2.keys.get_pubkey(String(secret), true)
      const content = `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amount}"}`
      const script = (0, exports.createInscriptionScript)(pubKey, content)
      const tapleaf = tapscript_1.Tap.encodeScript(script)
      const [tpubkey, cblock] = tapscript_1.Tap.getPubKey(pubKey, {
        target: tapleaf,
      })
      const inscriberAddress = tapscript_1.Address.p2tr.fromPubKey(
        tpubkey,
        network
      )
      const psbt = new bitcoin.Psbt({ network: getNetwork(network) })
      try {
        for (
          var _o = true, _p = __asyncValues(utxosToSend.selectedUtxos), _q;
          (_q = yield _p.next()), (_j = _q.done), !_j;

        ) {
          _l = _q.value
          _o = false
          try {
            const utxo = _l
            psbt.addInput({
              hash: utxo.txId,
              index: utxo.outputIndex,
              witnessUtxo: {
                script: Buffer.from(utxo.scriptPk, 'hex'),
                value: utxo.satoshis,
              },
            })
          } finally {
            _o = true
          }
        }
      } catch (e_2_1) {
        e_2 = { error: e_2_1 }
      } finally {
        try {
          if (!_o && !_j && (_k = _p.return)) yield _k.call(_p)
        } finally {
          if (e_2) throw e_2.error
        }
      }
      const reimbursementAmount = amountGathered - amountNeededForBrc20Send
      psbt.addOutput({
        value: feeForReveal,
        address: inscriberAddress,
      })
      if (reimbursementAmount > 546) {
        psbt.addOutput({
          value: reimbursementAmount,
          address: inputAddress,
        })
      }
      const toSignInputs = yield (0, exports.formatOptionsToSignInputs)({
        _psbt: psbt,
        pubkey: taprootPublicKey,
        segwitPubkey: segwitPublicKey,
        segwitAddress: segwitAddress,
        taprootAddress: inputAddress,
        network: getNetwork(network),
      })
      const signedPsbt = yield (0, exports.signInputs)(
        psbt,
        toSignInputs,
        taprootPublicKey,
        segwitPublicKey,
        segwitSigner,
        taprootSigner
      )
      signedPsbt.finalizeAllInputs()
      const commitPsbtHash = signedPsbt.toHex()
      const commitTxPsbt = bitcoin.Psbt.fromHex(commitPsbtHash, {
        network: getNetwork(network),
      })
      const commitTxHex = commitTxPsbt.extractTransaction().toHex()
      let commitTxId
      if (isDry) {
        commitTxId = commitTxPsbt.extractTransaction().getId()
        return { commitRawTxn: commitTxHex, txnId: commitTxId }
      } else {
        const { result } = yield (0, exports.callBTCRPCEndpoint)(
          'sendrawtransaction',
          commitTxHex,
          network
        )
        commitTxId = result
      }
      if (!isDry) {
        const txResult = yield waitForTransaction(commitTxId, network)
        if (!txResult) {
          return { error: 'ERROR WAITING FOR COMMIT TX' }
        }
      }
      const commitTxOutput = yield getOutputValueByVOutIndex(
        commitTxId,
        0,
        network
      )
      if (!commitTxOutput) {
        return { error: 'ERROR GETTING FIRST INPUT VALUE' }
      }
      const [commitReceiptValue, commitReceiptPubkey] =
        yield getOutputValueByVOutIndex(commitTxId, 1, network)
      const txData = tapscript_1.Tx.create({
        vin: [
          {
            txid: commitTxId,
            vout: 0,
            prevout: {
              value: feeForReveal,
              scriptPubKey: ['OP_1', tpubkey],
            },
          },
        ],
        vout: [
          {
            value: 546,
            scriptPubKey: tapscript_1.Address.toScriptPubKey(inputAddress),
          },
        ],
      })
      const sig = tapscript_1.Signer.taproot.sign(secKey, txData, 0, {
        extension: tapleaf,
      })
      txData.vin[0].witness = [sig, script, cblock]
      if (!isDry) {
        const {
          result: transferInscriptionTxId,
          error: transferInscribeError,
        } = yield (0, exports.callBTCRPCEndpoint)(
          'sendrawtransaction',
          tapscript_1.Tx.encode(txData).hex,
          network
        )
        const txResult = yield waitForTransaction(
          transferInscriptionTxId,
          network
        )
        if (!txResult) {
          return { error: 'ERROR WAITING FOR COMMIT TX' }
        }
        const sendPsbt = new bitcoin.Psbt({ network: getNetwork(network) })
        sendPsbt.addInput({
          hash: transferInscriptionTxId,
          index: 0,
          witnessUtxo: {
            script: Buffer.from(commitReceiptPubkey, 'hex'),
            value: 546,
          },
        })
        sendPsbt.addInput({
          hash: commitTxId,
          index: 1,
          witnessUtxo: {
            script: Buffer.from(commitReceiptPubkey, 'hex'),
            value: commitReceiptValue,
          },
        })
        sendPsbt.addOutput({
          address: outputAddress,
          value: 546,
        })
        const reimbursementAmount = commitReceiptValue - feeForSend
        if (reimbursementAmount > 546) {
          sendPsbt.addOutput({
            address: inputAddress,
            value: reimbursementAmount,
          })
        }
        const toSignInputs = yield (0, exports.formatOptionsToSignInputs)({
          _psbt: sendPsbt,
          pubkey: taprootPublicKey,
          segwitPubkey: segwitPublicKey,
          segwitAddress: segwitAddress,
          taprootAddress: inputAddress,
          network: getNetwork(network),
        })
        const signedSendPsbt = yield (0, exports.signInputs)(
          sendPsbt,
          toSignInputs,
          taprootPublicKey,
          segwitPublicKey,
          segwitSigner,
          taprootSigner
        )
        signedSendPsbt.finalizeAllInputs()
        const sendTxHex = signedSendPsbt.extractTransaction().toHex()
        const { result, error, id } = yield (0, exports.callBTCRPCEndpoint)(
          'sendrawtransaction',
          sendTxHex,
          network
        )
        return { txnId: result }
      } else {
        return {
          commitRawTxn: commitTxHex,
          txnId: tapscript_1.Tx.util.getTxid(txData),
          rawTxn: tapscript_1.Tx.encode(txData).hex,
        }
      }
    } catch (e) {
      return { error: e.message }
    }
  })
exports.inscribe = inscribe
const createInscriptionScript = (pubKey, content) => {
  const mimeType = 'text/plain;charset=utf-8'
  const textEncoder = new TextEncoder()
  const marker = textEncoder.encode('ord')
  return [
    pubKey,
    'OP_CHECKSIG',
    'OP_0',
    'OP_IF',
    marker,
    '01',
    textEncoder.encode(mimeType),
    'OP_0',
    textEncoder.encode(content),
    'OP_ENDIF',
  ]
}
exports.createInscriptionScript = createInscriptionScript
const INSCRIPTION_PREPARE_SAT_AMOUNT = 4000
exports.RPC_ADDR =
  'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094'
const callBTCRPCEndpoint = (method, params, network) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (network === 'testnet') {
      exports.RPC_ADDR =
        'https://testnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094'
    }
    if (network === 'regtest') {
      exports.RPC_ADDR === 'http://localhost:3000/v1/regtest'
    }
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: method,
      method: method,
      params: [params],
    })
    // @ts-ignore
    return yield axios_1.default
      .post(exports.RPC_ADDR, data, {
        headers: {
          'content-type': 'application/json',
        },
      })
      .then((res) => res.data)
      .catch((e) => {
        console.error(e.response)
        throw e
      })
  })
exports.callBTCRPCEndpoint = callBTCRPCEndpoint
function waitForTransaction(txId, network) {
  return __awaiter(this, void 0, void 0, function* () {
    console.log('WAITING FOR TRANSACTION: ', txId)
    const timeout = 60000 // 1 minute in milliseconds
    const startTime = Date.now()
    while (true) {
      try {
        // Call the endpoint to check the transaction
        const response = yield (0, exports.callBTCRPCEndpoint)(
          'esplora_tx',
          txId,
          network
        )
        // Check if the transaction is found
        if (response && response.result) {
          console.log('Transaction found in mempool:', txId)
          return [true, response]
        }
        // Check for timeout
        if (Date.now() - startTime > timeout) {
          console.log('Timeout reached, stopping search.')
          return [false]
        }
        // Wait for 5 seconds before retrying
        yield new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        // Check for timeout
        if (Date.now() - startTime > timeout) {
          console.log('Timeout reached, stopping search.')
          return [false]
        }
        // Wait for 5 seconds before retrying
        yield new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }
  })
}
exports.waitForTransaction = waitForTransaction
function getOutputValueByVOutIndex(commitTxId, vOut, network = 'mainnet') {
  return __awaiter(this, void 0, void 0, function* () {
    const timeout = 60000 // 1 minute in milliseconds
    const startTime = Date.now()
    while (true) {
      try {
        // Call to get the transaction details
        const txDetails = yield (0, exports.callBTCRPCEndpoint)(
          'esplora_tx',
          commitTxId,
          network
        )
        if (
          txDetails &&
          txDetails.result &&
          txDetails.result.vout &&
          txDetails.result.vout.length > 0
        ) {
          return [
            txDetails.result.vout[vOut].value,
            txDetails.result.vout[vOut].scriptpubkey,
          ]
        }
        // Check for timeout
        if (Date.now() - startTime > timeout) {
          console.log('Timeout reached, stopping search.')
          return null
        }
        // Wait for 5 seconds before retrying
        yield new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        console.error('Error fetching transaction output value:', error)
        // Check for timeout
        if (Date.now() - startTime > timeout) {
          console.log('Timeout reached, stopping search.')
          return null
        }
        // Wait for 5 seconds before retrying
        yield new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }
  })
}
exports.getOutputValueByVOutIndex = getOutputValueByVOutIndex
function calculateTaprootTxSize(
  taprootInputCount,
  nonTaprootInputCount,
  outputCount
) {
  const baseTxSize = 10 // Base transaction size without inputs/outputs
  // Size contributions from inputs
  const taprootInputSize = 57 // Average size of a Taproot input (can vary)
  const nonTaprootInputSize = 41 // Average size of a non-Taproot input (can vary)
  // Size contributions from outputs
  const outputSize = 34 // Average size of an output (can vary)
  // Calculate total input and output sizes
  const totalInputSize =
    taprootInputCount * taprootInputSize +
    nonTaprootInputCount * nonTaprootInputSize
  const totalOutputSize = outputCount * outputSize
  // Total transaction size
  return baseTxSize + totalInputSize + totalOutputSize
}
exports.calculateTaprootTxSize = calculateTaprootTxSize
function getRawTxnHashFromTxnId(txnId) {
  return __awaiter(this, void 0, void 0, function* () {
    const res = yield axios_1.default.post(
      'https://mainnet.sandshrew.io/v1/6e3bc3c289591bb447c116fda149b094',
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'btc_getrawtransaction',
        params: [txnId],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
    return res.data
  })
}
exports.getRawTxnHashFromTxnId = getRawTxnHashFromTxnId
const isP2PKH = (script, network) => {
  const p2pkh = checkPaymentType(bitcoin.payments.p2pkh, network)(script)
  return {
    type: 'p2pkh',
    payload: p2pkh,
  }
}
exports.isP2PKH = isP2PKH
const isP2WPKH = (script, network) => {
  const p2wpkh = checkPaymentType(bitcoin.payments.p2wpkh, network)(script)
  return {
    type: 'p2wpkh',
    payload: p2wpkh,
  }
}
exports.isP2WPKH = isP2WPKH
const isP2WSHScript = (script, network) => {
  const p2wsh = checkPaymentType(bitcoin.payments.p2wsh, network)(script)
  return {
    type: 'p2sh',
    payload: p2wsh,
  }
}
exports.isP2WSHScript = isP2WSHScript
const isP2SHScript = (script, network) => {
  const p2sh = checkPaymentType(bitcoin.payments.p2sh, network)(script)
  return {
    type: 'p2sh',
    payload: p2sh,
  }
}
exports.isP2SHScript = isP2SHScript
const isP2TR = (script, network) => {
  const p2tr = checkPaymentType(bitcoin.payments.p2tr, network)(script)
  return {
    type: 'p2tr',
    payload: p2tr,
  }
}
exports.isP2TR = isP2TR
const sendCollectible = ({
  inscriptionId,
  inputAddress,
  outputAddress,
  mnemonic,
  taprootPublicKey,
  segwitPublicKey,
  segwitAddress,
  isDry,
  segwitSigner,
  taprootSigner,
  payFeesWithSegwit = true,
  feeRate,
  network,
  taprootUtxos,
  segwitUtxos,
  metaOutputValue,
  sandshrew,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const psbt = new bitcoin.Psbt({ network: getNetwork(network) })
    const utxosToSend = yield insertCollectibleUtxo({
      taprootUtxos: taprootUtxos,
      inscriptionId: inscriptionId,
      toAddress: outputAddress,
      psbt: psbt,
    })
    psbt.txOutputs[0].value = metaOutputValue
    yield (0, buildOrdTx_1.getUtxosForFees)({
      payFeesWithSegwit: payFeesWithSegwit,
      psbtTx: psbt,
      taprootUtxos: taprootUtxos,
      segwitUtxos: segwitUtxos,
      segwitAddress: segwitAddress,
      feeRate: feeRate,
      taprootAddress: inputAddress,
      segwitPubKey: segwitPublicKey,
      utxosToSend: utxosToSend,
      network: getNetwork(network),
    })
    const toSignInputs = yield (0, exports.formatOptionsToSignInputs)({
      _psbt: psbt,
      pubkey: taprootPublicKey,
      segwitPubkey: segwitPublicKey,
      segwitAddress: segwitAddress,
      taprootAddress: inputAddress,
      network: getNetwork(network),
    })
    const signedPsbt = yield (0, exports.signInputs)(
      psbt,
      toSignInputs,
      taprootPublicKey,
      segwitPublicKey,
      segwitSigner,
      taprootSigner
    )
    signedPsbt.finalizeAllInputs()
    const rawTx = signedPsbt.extractTransaction().toHex()
    const txId = signedPsbt.extractTransaction().getId()
    const [result] = yield sandshrew.bitcoindRpc.testMemPoolAccept([rawTx])
    if (!result.allowed) {
      throw new Error(result['reject-reason'])
    }
    if (!isDry) {
      yield sandshrew.bitcoindRpc.sendRawTransaction(rawTx)
    }
    return { txId, rawTx }
  })
exports.sendCollectible = sendCollectible
const insertCollectibleUtxo = ({
  taprootUtxos,
  inscriptionId,
  toAddress,
  psbt,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const { metaUtxos } = taprootUtxos.reduce(
        (acc, utxo) => {
          utxo.inscriptions.length
            ? acc.metaUtxos.push(utxo)
            : acc.nonMetaUtxos.push(utxo)
          return acc
        },
        { metaUtxos: [], nonMetaUtxos: [] }
      )
      return yield (0, buildOrdTx_1.addInscriptionUtxo)({
        metaUtxos: metaUtxos,
        inscriptionId: inscriptionId,
        toAddress: toAddress,
        psbtTx: psbt,
      })
    } catch (error) {
      console.log(error)
    }
  })
const insertBtcUtxo = ({
  taprootUtxos,
  segwitUtxos,
  toAddress,
  fromAddress,
  psbt,
  amount,
  useTaprootUtxos,
  segwitPubKey,
  feeRate,
  network,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      let nonMetaUtxos
      if (useTaprootUtxos) {
        nonMetaUtxos = yield (0, exports.filterTaprootUtxos)({
          taprootUtxos: taprootUtxos,
        })
      } else {
        nonMetaUtxos = segwitUtxos
      }
      return yield addBTCUtxo({
        utxos: nonMetaUtxos,
        toAddress: toAddress,
        psbtTx: psbt,
        amount: amount,
        fromAddress: fromAddress,
        segwitPubKey: segwitPubKey,
        feeRate,
        network,
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  })
const filterTaprootUtxos = ({ taprootUtxos }) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { nonMetaUtxos } = taprootUtxos.reduce(
      (acc, utxo) => {
        utxo.inscriptions.length > 0 || utxo.satoshis === 546
          ? acc.metaUtxos.push(utxo)
          : acc.nonMetaUtxos.push(utxo)
        return acc
      },
      { metaUtxos: [], nonMetaUtxos: [] }
    )
    return nonMetaUtxos
  })
exports.filterTaprootUtxos = filterTaprootUtxos
const addBTCUtxo = ({
  utxos,
  toAddress,
  psbtTx,
  amount,
  feeRate,
  fromAddress,
  segwitPubKey,
  network,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const txSize = calculateTaprootTxSize(3, 0, 2)
    const fee = txSize * feeRate < 150 ? 200 : txSize * feeRate
    const utxosToSend = (0, buildOrdTx_1.findUtxosToCoverAmount)(
      utxos,
      amount + fee
    )
    if (!utxosToSend) {
      throw new Error('insufficient balance')
    }
    const amountGathered = calculateAmountGatheredUtxo(
      utxosToSend.selectedUtxos
    )
    const addressType = (0, transactions_1.getAddressType)(fromAddress)
    let redeemScript
    if (addressType === 2) {
      const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(segwitPubKey, 'hex'),
        network: network,
      })
      redeemScript = p2wpkh.output
    }
    for (let i = 0; i < utxosToSend.selectedUtxos.length; i++) {
      if (addressType === 2) {
        psbtTx.addInput({
          hash: utxosToSend.selectedUtxos[i].txId,
          index: utxosToSend.selectedUtxos[i].outputIndex,
          witnessUtxo: {
            value: utxosToSend.selectedUtxos[i].satoshis,
            script: Buffer.from(utxosToSend.selectedUtxos[i].scriptPk, 'hex'),
          },
          redeemScript: redeemScript,
        })
      } else {
        psbtTx.addInput({
          hash: utxosToSend.selectedUtxos[i].txId,
          index: utxosToSend.selectedUtxos[i].outputIndex,
          witnessUtxo: {
            value: utxosToSend.selectedUtxos[i].satoshis,
            script: Buffer.from(utxosToSend.selectedUtxos[i].scriptPk, 'hex'),
          },
        })
      }
    }
    psbtTx.addOutput({
      address: toAddress,
      value: Math.floor(amount),
    })
    const changeAmount = amountGathered - amount - fee
    if (changeAmount > 546) {
      psbtTx.addOutput({
        address: fromAddress,
        value: changeAmount,
      })
    }
    return utxosToSend
  })
const createBtcTx = ({
  inputAddress,
  outputAddress,
  mnemonic,
  taprootPublicKey,
  segwitPublicKey,
  segwitAddress,
  isDry,
  segwitSigner,
  taprootSigner,
  payFeesWithSegwit = false,
  feeRate,
  amount,
  network,
  segwitUtxos,
  taprootUtxos,
}) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const psbt = new bitcoin.Psbt({ network: network })
      const inputAddressType =
        addressTypeMap[(0, transactions_1.getAddressType)(inputAddress)]
      const useTaprootUtxos = !(
        interface_1.addressTypeToName[inputAddressType] === 'nested-segwit' ||
        interface_1.addressTypeToName[inputAddressType] === 'segwit'
      )
      yield insertBtcUtxo({
        taprootUtxos: taprootUtxos,
        segwitUtxos: segwitUtxos,
        psbt: psbt,
        toAddress: outputAddress,
        amount: amount,
        useTaprootUtxos: useTaprootUtxos,
        segwitPubKey: segwitPublicKey,
        fromAddress: inputAddress,
        feeRate,
        network,
      })
      const toSignInputs = yield (0, exports.formatOptionsToSignInputs)({
        _psbt: psbt,
        pubkey: taprootPublicKey,
        segwitPubkey: segwitPublicKey,
        segwitAddress: segwitAddress,
        taprootAddress: inputAddress,
        network,
      })
      const signedPsbt = yield (0, exports.signInputs)(
        psbt,
        toSignInputs,
        taprootPublicKey,
        segwitPublicKey,
        segwitSigner,
        taprootSigner
      )
      signedPsbt.finalizeAllInputs()
      return {
        txnId: signedPsbt.extractTransaction().getId(),
        rawTxn: signedPsbt.extractTransaction().toHex(),
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  })
exports.createBtcTx = createBtcTx
//# sourceMappingURL=utils.js.map
