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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = exports.swapFlow = exports.callAPI = exports.loadRpc = void 0;
const yargs_1 = __importDefault(require("yargs"));
const change_case_1 = require("change-case");
const oylib_1 = require("./oylib");
const PSBTTransaction_1 = require("./txbuilder/PSBTTransaction");
const transactions = __importStar(require("./transactions"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
function loadRpc(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const rpcOptions = {
            host: options.host,
            port: options.port,
            network: options.network,
            auth: options.apiKey,
        };
        const wallet = new oylib_1.Wallet();
        const rpc = wallet.fromProvider(rpcOptions);
        return rpc;
    });
}
exports.loadRpc = loadRpc;
function callAPI(command, data, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const oylSdk = new oylib_1.Wallet();
        const camelCommand = (0, change_case_1.camelCase)(command);
        if (!oylSdk[camelCommand])
            throw Error('command not foud: ' + camelCommand);
        const result = yield oylSdk[camelCommand](data);
        console.log(JSON.stringify(result, null, 2));
        return result;
    });
}
exports.callAPI = callAPI;
function swapFlow(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = options.address;
        const feeRate = options.feeRate;
        const mnemonic = options.mnemonic;
        const pubKey = options.pubKey;
        const psbt = bitcoin.Psbt.fromHex(options.psbt, {
            network: bitcoin.networks.bitcoin,
        });
        const wallet = new oylib_1.Wallet();
        const payload = yield wallet.fromPhrase({
            mnemonic: mnemonic.trim(),
            hdPath: options.hdPath,
            type: options.type,
        });
        const keyring = payload.keyring.keyring;
        const signer = keyring.signTransaction.bind(keyring);
        const from = address;
        const addressType = transactions.getAddressType(from);
        if (addressType == null)
            throw Error('Invalid Address Type');
        const tx = new PSBTTransaction_1.PSBTTransaction(signer, from, pubKey, addressType, feeRate);
        const psbt_ = yield tx.signPsbt(psbt);
        return psbt_.toHex();
    });
}
exports.swapFlow = swapFlow;
// export async function getOrdInscription() {
//    const address = "";
//    const inscriptions = await getInscriptionsByAddr(address);
//    let ordInscriptions = [];
//    for (let i = 0; i < inscriptions.length; i++) {
//     const genesisTransaction = inscriptions[i].genesis_transaction;
//     const txhash = genesisTransaction.substring(genesisTransaction.lastIndexOf("/") + 1);
//     if (await checkProtocol(txhash)) {
//       ordInscriptions.push(inscriptions[i]);
//     }
//   }
//   console.log(ordInscriptions.length)
//   return ordInscriptions;
// }
function inscribeTest() {
    return __awaiter(this, void 0, void 0, function* () {
        //    // new inscription tx
        //    const transaction = new Inscriber({
        //     network: "mainnet",
        //     address: "bc1p2hq8sx32n8993teqgcgrndw4qege6shjkcewgwpudqkqelgmw4ksmv4hud",
        //     publicKey: "03223e9553641f278d14dff04a90fa14eedc3789279804832a7e01db3317c7e92d",
        //     changeAddress: "bc1p2hq8sx32n8993teqgcgrndw4qege6shjkcewgwpudqkqelgmw4ksmv4hud",
        //     destinationAddress: "bc1p2hq8sx32n8993teqgcgrndw4qege6shjkcewgwpudqkqelgmw4ksmv4hud",
        //     mediaContent: 'Hello World',
        //     mediaType: "text/plain",
        //     feeRate: 3,
        //     meta: { // Flexible object: Record<string, any>
        //       title: "Example title",
        //       desc: "Lorem ipsum",
        //       slug: "cool-digital-artifact",
        //       creator: {
        //         name: "Your Name",
        //         email: "artist@example.org",
        //         address: "bc1p2hq8sx32n8993teqgcgrndw4qege6shjkcewgwpudqkqelgmw4ksmv4hud"
        //       }
        //     },
        //     postage: 1500 // base value of the inscription in sats
        //   })
        //   const revealed = await transaction.generateCommit();
        //   console.log("Revealed: ", revealed)
        //   const wallet = new Wallet()
        //   const depositRevealFee = await wallet.sendBtc({
        //     mnemonic: 'great move degree abstract scatter become lab walnut infant evoke quick impose',
        //     to: revealed.address,
        //     amount: revealed.revealFee / 100000000,
        //     fee: 5,
        //   })
        //   console.log("deposit reveal fee", depositRevealFee)
        //   const ready = await transaction.isReady();
        //   if (ready) {
        //     await transaction.build();
        //     console.log("transaction: ", transaction.toHex())
        // }
        const wallet = new oylib_1.Wallet();
        const psbtHex = "70736274ff01005e02000000014f006499d476c0378c137e8cbafeda5387673bbef5c213dd08497bb8659a83840000000000fdffffff01dc0500000000000022512055c0781a2a99ca58af20461039b5d506519d42f2b632e4383c682c0cfd1b756d000000000001012b4f080000000000002251203b334fc5d6cfa515fb35cd24b86a12c98049c8b29c5c388a05706af0e211942d4215c1223e9553641f278d14dff04a90fa14eedc3789279804832a7e01db3317c7e92d8ef13a6326535ec1c8a6bf9afb6ecce833af7b8b598298c16d28cf9ccec4b8ecfd430120223e9553641f278d14dff04a90fa14eedc3789279804832a7e01db3317c7e92dac0063036f726401010a746578742f706c61696e000b48656c6c6f20576f726c64680063036f726401011e6170706c69636174696f6e2f6a736f6e3b636861727365743d7574662d38004cd47b227469746c65223a224578616d706c65207469746c65222c2264657363223a224c6f72656d20697073756d222c22736c7567223a22636f6f6c2d6469676974616c2d6172746966616374222c2263726561746f72223a7b226e616d65223a22596f7572204e616d65222c22656d61696c223a22617274697374406578616d706c652e6f7267222c2261646472657373223a226263317032687138737833326e38393933746571676367726e647734716567653673686a6b6365776777707564716b71656c676d77346b736d7634687564227d7d68c0011720223e9553641f278d14dff04a90fa14eedc3789279804832a7e01db3317c7e92d0000";
        const vPsbt = bitcoin.Psbt.fromHex(psbtHex, {
            network: bitcoin.networks.bitcoin,
        });
        const completeInscription = yield wallet.signInscriptionPsbt({ psbt: vPsbt, fee: 5 });
        console.log(completeInscription);
    });
}
function recoverTest() {
    return __awaiter(this, void 0, void 0, function* () {
        const wallet = new oylib_1.Wallet();
        const tx = yield wallet.addAccountToWallet({
            mnemonic: 'great move degree abstract scatter become lab walnut infant evoke quick impose',
            activeIndexes: [0],
            customPath: 'xverse',
        });
        console.log(tx);
    });
}
function runCLI() {
    return __awaiter(this, void 0, void 0, function* () {
        const [command] = yargs_1.default.argv._;
        const options = Object.assign({}, yargs_1.default.argv);
        delete options._;
        switch (command) {
            case 'load':
                return yield loadRpc(options);
                break;
            case 'recover':
                return yield inscribeTest();
                break;
            default:
                return yield callAPI(yargs_1.default.argv._[0], options);
                break;
        }
    });
}
exports.runCLI = runCLI;
//# sourceMappingURL=cli.js.map