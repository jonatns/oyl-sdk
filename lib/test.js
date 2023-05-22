"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_1 = require("./wallet");
const rpclient_1 = require("./rpclient");
const oylib_1 = require("./oylib");
// //node-port: 8333
// //wallet-port: 8334
const clientOptions = {
    network: 'main',
    port: 8332,
    host: "198.199.72.193",
    apiKey: 'bikeshed'
};
const address = "bc1pc837xc4vfq66g2wm3hy6rd4nxjlkwcl46m4wn2n6u0afd45h472sx8924n";
const address2 = "bc1pakyzxwpk5hxaw7me4rmculprgnfceuxaxyuwjewrjlqwwy5gjk4shksvy2";
const hash = "2911040743b16b71c4c00dc2561b91dac87650e0957d8acd016da0ffd8d3d511";
const hash2 = "8c29b3c193424c85d254052fa5cdc3bcd20b26f50603702ac67700bc4afbd259";
const addressWithBal = "bc1p527kv6mrq2sn5l7ukapq4q4a4puqfd9jsm7fv6r06c5726kyk57qnfvs4e";
const hashWithInscription = "ff4503ab9048d6d0ff4e23def81b614d5270d341ce993992e93902ceb0d4ed79";
const nodeClient = new rpclient_1.NodeClient(clientOptions);
(() => __awaiter(void 0, void 0, void 0, function* () {
    const walletUtil = new oylib_1.WalletUtils();
    console.log(`Getting Address summary of ${addressWithBal}`, yield walletUtil.getAddressSummary([addressWithBal]));
    console.log(`Getting txbyaddress of  ${address}`, yield nodeClient.getTXByAddress(address));
    console.log(`Getting Inscription by tx hash: ${hashWithInscription}`, yield wallet_1.bord.getInscriptionByHash(hashWithInscription));
    console.log(`Getting Inscription by address of ${addressWithBal}`, yield wallet_1.bord.getInscriptionsByAddr(addressWithBal));
}))();
//# sourceMappingURL=test.js.map