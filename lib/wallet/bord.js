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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInscriptionsByAddr = exports.getInscriptionByHash = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
/*
*
*
Need to figure out how to get inscriptions locally. At the moment,
it uses a public api, Getting inscriptions directly on the client
with a normal rpc server (without indexing) is tricky. It involves two considerations
The first one was explained in the README, still working on the
second one. There is just a pattern/route we need to look for.
*
*
*/
const getInscriptionByHash = (txhash) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, node_fetch_1.default)(`https://ordapi.xyz/output/${txhash}:0`, {
            headers: {
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch inscriptions for address ${txhash}`);
        }
        const jsonResponse = yield response.json();
        //TO-DO: Fix type
        const inscriptionsArr = [];
        if (jsonResponse.inscriptions) {
            const path = jsonResponse.inscriptions;
            let inscription = {
                inscriptionid: path.split('/inscription/')[1],
                value: jsonResponse.value,
                address: jsonResponse.address,
            };
            inscriptionsArr.push(inscription);
        }
        return inscriptionsArr;
    }
    catch (error) {
        console.error(error);
    }
});
exports.getInscriptionByHash = getInscriptionByHash;
const getInscriptionsByAddr = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, node_fetch_1.default)(`https://ordapi.xyz/address/${address}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch inscriptions for address ${address}`);
        }
        //TO-DO fix types
        const inscriptionsJson = yield response.json();
        return inscriptionsJson;
    }
    catch (error) {
        console.error(error);
    }
});
exports.getInscriptionsByAddr = getInscriptionsByAddr;
//# sourceMappingURL=bord.js.map