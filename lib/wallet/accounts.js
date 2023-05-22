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
exports.createWallet = void 0;
/*
*
*
The  parent key should be able to be derived sequentially. The UI can select/change
the path parameters (e.g "44"/"49"/"86")
// */
const hdKeyring_1 = require("./keyrings/hdKeyring");
function createWallet(hdPathString) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a new instance of HdKeyring with the provided hdPathString
        const keyring = yield new hdKeyring_1.HdKeyring({ hdPath: hdPathString });
        // Add a single account to the keyring
        yield keyring.addAccounts(1);
        // Get the first account address
        const accounts = yield keyring.getAccounts();
        const address = accounts[0];
        console.log("keyring: ", keyring);
        // Return the address
        return keyring;
    });
}
exports.createWallet = createWallet;
//# sourceMappingURL=accounts.js.map