"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrc20Data = exports.MAXIMUM_FEE = exports.maximumScriptBytes = exports.UTXO_DUST = void 0;
exports.UTXO_DUST = 546;
exports.maximumScriptBytes = 520;
exports.MAXIMUM_FEE = 5000000;
const getBrc20Data = ({ amount, tick, }) => ({
    mediaContent: `{"p":"brc-20","op":"transfer","tick":"${tick}","amt":"${amount}"}`,
    mediaType: 'text/plain',
});
exports.getBrc20Data = getBrc20Data;
//# sourceMappingURL=constants.js.map