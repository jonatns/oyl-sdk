/*!
 * bcoin@2.2.0 - Bitcoin bike-shed
 * Copyright (c) 2023, Fedor Indutny (MIT)
 * https://github.com/bcoin-org/bcoin
 *
 * License for bcoin@2.2.0:
 *
 * This software is licensed under the MIT License.
 *
 * Copyright (c) 2014-2015, Fedor Indutny (https://github.com/indutny)
 *
 * Copyright (c) 2014-2017, Christopher Jeffrey (https://github.com/chjj)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * License for bsert@0.0.10:
 *
 * This software is licensed under the MIT License.
 *
 * Copyright (c) 2018, Christopher Jeffrey (https://github.com/chjj)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * License for bcurl@0.2.0:
 *
 * This software is licensed under the MIT License.
 *
 * Copyright (c) 2017, Christopher Jeffrey (https://github.com/chjj)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * License for bsock@0.1.9:
 *
 * This software is licensed under the MIT License.
 *
 * Copyright (c) 2017, Christopher Jeffrey (https://github.com/chjj)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * License for brq@0.1.8:
 *
 * This software is licensed under the MIT License.
 *
 * Copyright (c) 2017, Christopher Jeffrey (https://github.com/chjj)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

;(function(global) {
var globalThis = global;
var undefined;

var setTimeout = global.setTimeout;
var clearTimeout = global.clearTimeout;
var setInterval = global.setInterval;
var clearInterval = global.clearInterval;
var setImmediate = global.setImmediate;
var clearImmediate = global.clearImmediate;

var process;

var Buffer;

var console = global.console;

var __browser_modules__ = [
[/* 0 */ 'bcoin', '/lib/client/index.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * client/index.js - client for bcoin
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

/**
 * @module client
 */

exports.NodeClient = __browser_require__(1 /* './node' */, module);
exports.WalletClient = __browser_require__(23 /* './wallet' */, module);
}],
[/* 1 */ 'bcoin', '/lib/client/node.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * node.js - http node client for bcoin
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);
const {Client} = __browser_require__(3 /* 'bcurl' */, module);

/**
 * Node Client
 * @alias module:client.NodeClient
 * @extends {bcurl.Client}
 */

class NodeClient extends Client {
  /**
   * Creat a node client.
   * @param {Object?} options
   */

  constructor(options) {
    super(options);
  }

  /**
   * Auth with server.
   * @returns {Promise}
   */

  async auth() {
    await this.call('auth', this.password);
    await this.watchChain();
    await this.watchMempool();
  }

  /**
   * Make an RPC call.
   * @returns {Promise}
   */

  execute(name, params) {
    return super.execute('/', name, params);
  }

  /**
   * Get a mempool snapshot.
   * @returns {Promise}
   */

  getMempool() {
    return this.get('/mempool');
  }

  /**
   * Get some info about the server (network and version).
   * @returns {Promise}
   */

  getInfo() {
    return this.get('/');
  }

  /**
   * Get coins that pertain to an address from the mempool or chain database.
   * Takes into account spent coins in the mempool.
   * @param {String} address
   * @returns {Promise}
   */

  getCoinsByAddress(address) {
    assert(typeof address === 'string');
    return this.get(`/coin/address/${address}`);
  }

  /**
   * Get coins that pertain to addresses from the mempool or chain database.
   * Takes into account spent coins in the mempool.
   * @param {String[]} addresses
   * @returns {Promise}
   */

  getCoinsByAddresses(addresses) {
    assert(Array.isArray(addresses));
    return this.post('/coin/address', { addresses });
  }

  /**
   * Retrieve a coin from the mempool or chain database.
   * Takes into account spent coins in the mempool.
   * @param {Hash} hash
   * @param {Number} index
   * @returns {Promise}
   */

  getCoin(hash, index) {
    assert(typeof hash === 'string');
    assert((index >>> 0) === index);
    return this.get(`/coin/${hash}/${index}`);
  }

  /**
   * Retrieve transactions pertaining to an
   * address from the mempool or chain database.
   * @param {String} address
   * @returns {Promise}
   */

  getTXByAddress(address) {
    assert(typeof address === 'string');
    return this.get(`/tx/address/${address}`);
  }

  /**
   * Retrieve transactions pertaining to
   * addresses from the mempool or chain database.
   * @param {String[]} addresses
   * @returns {Promise}
   */

  getTXByAddresses(addresses) {
    assert(Array.isArray(addresses));
    return this.post('/tx/address', { addresses });
  }

  /**
   * Retrieve a transaction from the mempool or chain database.
   * @param {Hash} hash
   * @returns {Promise}
   */

  getTX(hash) {
    assert(typeof hash === 'string');
    return this.get(`/tx/${hash}`);
  }

  /**
   * Retrieve a block from the chain database.
   * @param {Hash|Number} block
   * @returns {Promise}
   */

  getBlock(block) {
    assert(typeof block === 'string' || typeof block === 'number');
    return this.get(`/block/${block}`);
  }

  /**
   * Retrieve a block header.
   * @param {Hash|Number} block
   * @returns {Promise}
   */

  getBlockHeader(block) {
    assert(typeof block === 'string' || typeof block === 'number');
    return this.get(`/header/${block}`);
  }

  /**
   * Retreive a filter from the filter indexer.
   * @param {Hash|Number} filter
   * @returns {Promise}
   */

  getFilter(filter) {
    assert(typeof filter === 'string' || typeof filter === 'number');
    return this.get(`/filter/${filter}`);
  }

  /**
   * Add a transaction to the mempool and broadcast it.
   * @param {TX} tx
   * @returns {Promise}
   */

  broadcast(tx) {
    assert(typeof tx === 'string');
    return this.post('/broadcast', { tx });
  }

  /**
   * Reset the chain.
   * @param {Number} height
   * @returns {Promise}
   */

  reset(height) {
    return this.post('/reset', { height });
  }

  /**
   * Watch the blockchain.
   * @private
   * @returns {Promise}
   */

  watchChain() {
    return this.call('watch chain');
  }

  /**
   * Watch the blockchain.
   * @private
   * @returns {Promise}
   */

  watchMempool() {
    return this.call('watch mempool');
  }

  /**
   * Get chain tip.
   * @returns {Promise}
   */

  getTip() {
    return this.call('get tip');
  }

  /**
   * Get chain entry.
   * @param {Hash} block
   * @returns {Promise}
   */

  getEntry(block) {
    return this.call('get entry', block);
  }

  /**
   * Get hashes.
   * @param {Number} [start=-1]
   * @param {Number} [end=-1]
   * @returns {Promise}
   */

  getHashes(start, end) {
    return this.call('get hashes', start, end);
  }

  /**
   * Send a transaction. Do not wait for promise.
   * @param {TX} tx
   * @returns {Promise}
   */

  send(tx) {
    assert((tx != null && tx._isBuffer === true));
    return this.call('send', tx);
  }

  /**
   * Set bloom filter.
   * @param {BloomFilter} filter
   * @returns {Promise}
   */

  setFilter(filter) {
    assert((filter != null && filter._isBuffer === true));
    return this.call('set filter', filter);
  }

  /**
   * Add data to filter.
   * @param {Buffer|Buffer[]} chunks
   * @returns {Promise}
   */

  addFilter(chunks) {
    if (!Array.isArray(chunks))
      chunks = [chunks];

    return this.call('add filter', chunks);
  }

  /**
   * Reset filter.
   * @returns {Promise}
   */

  resetFilter() {
    return this.call('reset filter');
  }

  /**
   * Estimate smart fee.
   * @param {Number?} blocks
   * @returns {Promise}
   */

  estimateFee(blocks) {
    assert(blocks == null || typeof blocks === 'number');
    let query = '/fee';
    if (blocks != null)
      query += `?blocks=${blocks}`;
    return this.get(query);
  }

  /**
   * Rescan for any missed transactions.
   * @param {Number|Hash} start - Start block.
   * @returns {Promise}
   */

  rescan(start) {
    if (start == null)
      start = 0;

    assert(typeof start === 'number' || typeof start === 'string');

    return this.call('rescan', start);
  }

  /**
   * Abort scanning blockchain
   * @returns {Promise}
   */

  abortRescan() {
    return this.call('abortrescan');
  }
}

/*
 * Expose
 */

module.exports = NodeClient;
}],
[/* 2 */ 'bsert', '/lib/assert.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * assert.js - assertions for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/bsert
 */

'use strict';

/**
 * AssertionError
 */

class AssertionError extends Error {
  constructor(options) {
    if (typeof options === 'string')
      options = { message: options };

    if (options === null || typeof options !== 'object')
      options = {};

    let message = null;
    let operator = 'fail';
    let generatedMessage = Boolean(options.generatedMessage);

    if (options.message != null)
      message = toString(options.message);

    if (typeof options.operator === 'string')
      operator = options.operator;

    if (message == null) {
      if (operator === 'fail') {
        message = 'Assertion failed.';
      } else {
        const a = stringify(options.actual);
        const b = stringify(options.expected);

        message = `${a} ${operator} ${b}`;
      }

      generatedMessage = true;
    }

    super(message);

    let start = this.constructor;

    if (typeof options.stackStartFunction === 'function')
      start = options.stackStartFunction;
    else if (typeof options.stackStartFn === 'function')
      start = options.stackStartFn;

    this.type = 'AssertionError';
    this.name = 'AssertionError [ERR_ASSERTION]';
    this.code = 'ERR_ASSERTION';
    this.generatedMessage = generatedMessage;
    this.actual = options.actual;
    this.expected = options.expected;
    this.operator = operator;

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, start);
  }
}

/*
 * Assert
 */

function assert(value, message) {
  if (!value) {
    let generatedMessage = false;

    if (arguments.length === 0) {
      message = 'No value argument passed to `assert()`.';
      generatedMessage = true;
    } else if (message == null) {
      message = 'Assertion failed.';
      generatedMessage = true;
    } else if (isError(message)) {
      throw message;
    }

    throw new AssertionError({
      message,
      actual: value,
      expected: true,
      operator: '==',
      generatedMessage,
      stackStartFn: assert
    });
  }
}

function equal(actual, expected, message) {
  if (!Object.is(actual, expected)) {
    if (isError(message))
      throw message;

    throw new AssertionError({
      message,
      actual,
      expected,
      operator: 'strictEqual',
      stackStartFn: equal
    });
  }
}

function notEqual(actual, expected, message) {
  if (Object.is(actual, expected)) {
    if (isError(message))
      throw message;

    throw new AssertionError({
      message,
      actual,
      expected,
      operator: 'notStrictEqual',
      stackStartFn: notEqual
    });
  }
}

function fail(message) {
  let generatedMessage = false;

  if (isError(message))
    throw message;

  if (message == null) {
    message = 'Assertion failed.';
    generatedMessage = true;
  }

  throw new AssertionError({
    message,
    actual: false,
    expected: true,
    operator: 'fail',
    generatedMessage,
    stackStartFn: fail
  });
}

function throws(func, expected, message) {
  if (typeof expected === 'string') {
    message = expected;
    expected = undefined;
  }

  let thrown = false;
  let err = null;

  enforce(typeof func === 'function', 'func', 'function');

  try {
    func();
  } catch (e) {
    thrown = true;
    err = e;
  }

  if (!thrown) {
    let generatedMessage = false;

    if (message == null) {
      message = 'Missing expected exception.';
      generatedMessage = true;
    }

    throw new AssertionError({
      message,
      actual: undefined,
      expected,
      operator: 'throws',
      generatedMessage,
      stackStartFn: throws
    });
  }

  if (!testError(err, expected, message, throws))
    throw err;
}

function doesNotThrow(func, expected, message) {
  if (typeof expected === 'string') {
    message = expected;
    expected = undefined;
  }

  let thrown = false;
  let err = null;

  enforce(typeof func === 'function', 'func', 'function');

  try {
    func();
  } catch (e) {
    thrown = true;
    err = e;
  }

  if (!thrown)
    return;

  if (testError(err, expected, message, doesNotThrow)) {
    let generatedMessage = false;

    if (message == null) {
      message = 'Got unwanted exception.';
      generatedMessage = true;
    }

    throw new AssertionError({
      message,
      actual: err,
      expected,
      operator: 'doesNotThrow',
      generatedMessage,
      stackStartFn: doesNotThrow
    });
  }

  throw err;
}

async function rejects(func, expected, message) {
  if (typeof expected === 'string') {
    message = expected;
    expected = undefined;
  }

  let thrown = false;
  let err = null;

  if (typeof func !== 'function')
    enforce(isPromise(func), 'func', 'promise');

  try {
    if (isPromise(func))
      await func;
    else
      await func();
  } catch (e) {
    thrown = true;
    err = e;
  }

  if (!thrown) {
    let generatedMessage = false;

    if (message == null) {
      message = 'Missing expected rejection.';
      generatedMessage = true;
    }

    throw new AssertionError({
      message,
      actual: undefined,
      expected,
      operator: 'rejects',
      generatedMessage,
      stackStartFn: rejects
    });
  }

  if (!testError(err, expected, message, rejects))
    throw err;
}

async function doesNotReject(func, expected, message) {
  if (typeof expected === 'string') {
    message = expected;
    expected = undefined;
  }

  let thrown = false;
  let err = null;

  if (typeof func !== 'function')
    enforce(isPromise(func), 'func', 'promise');

  try {
    if (isPromise(func))
      await func;
    else
      await func();
  } catch (e) {
    thrown = true;
    err = e;
  }

  if (!thrown)
    return;

  if (testError(err, expected, message, doesNotReject)) {
    let generatedMessage = false;

    if (message == null) {
      message = 'Got unwanted rejection.';
      generatedMessage = true;
    }

    throw new AssertionError({
      message,
      actual: undefined,
      expected,
      operator: 'doesNotReject',
      generatedMessage,
      stackStartFn: doesNotReject
    });
  }

  throw err;
}

function ifError(err) {
  if (err != null) {
    let message = 'ifError got unwanted exception: ';

    if (typeof err === 'object' && typeof err.message === 'string') {
      if (err.message.length === 0 && err.constructor)
        message += err.constructor.name;
      else
        message += err.message;
    } else {
      message += stringify(err);
    }

    throw new AssertionError({
      message,
      actual: err,
      expected: null,
      operator: 'ifError',
      generatedMessage: true,
      stackStartFn: ifError
    });
  }
}

function deepEqual(actual, expected, message) {
  if (!isDeepEqual(actual, expected, false)) {
    if (isError(message))
      throw message;

    throw new AssertionError({
      message,
      actual,
      expected,
      operator: 'deepStrictEqual',
      stackStartFn: deepEqual
    });
  }
}

function notDeepEqual(actual, expected, message) {
  if (isDeepEqual(actual, expected, true)) {
    if (isError(message))
      throw message;

    throw new AssertionError({
      message,
      actual,
      expected,
      operator: 'notDeepStrictEqual',
      stackStartFn: notDeepEqual
    });
  }
}

function bufferEqual(actual, expected, enc, message) {
  if (!isEncoding(enc)) {
    message = enc;
    enc = null;
  }

  if (enc == null)
    enc = 'hex';

  expected = bufferize(actual, expected, enc);

  enforce(isBuffer(actual), 'actual', 'buffer');
  enforce(isBuffer(expected), 'expected', 'buffer');

  if (actual !== expected && !actual.equals(expected)) {
    if (isError(message))
      throw message;

    throw new AssertionError({
      message,
      actual: actual.toString(enc),
      expected: expected.toString(enc),
      operator: 'bufferEqual',
      stackStartFn: bufferEqual
    });
  }
}

function notBufferEqual(actual, expected, enc, message) {
  if (!isEncoding(enc)) {
    message = enc;
    enc = null;
  }

  if (enc == null)
    enc = 'hex';

  expected = bufferize(actual, expected, enc);

  enforce(isBuffer(actual), 'actual', 'buffer');
  enforce(isBuffer(expected), 'expected', 'buffer');

  if (actual === expected || actual.equals(expected)) {
    if (isError(message))
      throw message;

    throw new AssertionError({
      message,
      actual: actual.toString(enc),
      expected: expected.toString(enc),
      operator: 'notBufferEqual',
      stackStartFn: notBufferEqual
    });
  }
}

function enforce(value, name, type) {
  if (!value) {
    let msg;

    if (name == null) {
      msg = 'Invalid type for parameter.';
    } else {
      if (type == null)
        msg = `Invalid type for "${name}".`;
      else
        msg = `"${name}" must be a(n) ${type}.`;
    }

    const err = new TypeError(msg);

    if (Error.captureStackTrace)
      Error.captureStackTrace(err, enforce);

    throw err;
  }
}

function range(value, name) {
  if (!value) {
    const msg = name != null
      ? `"${name}" is out of range.`
      : 'Parameter is out of range.';

    const err = new RangeError(msg);

    if (Error.captureStackTrace)
      Error.captureStackTrace(err, range);

    throw err;
  }
}

/*
 * Stringification
 */

function stringify(value) {
  switch (typeof value) {
    case 'undefined':
      return 'undefined';
    case 'object':
      if (value === null)
        return 'null';
      return `[${objectName(value)}]`;
    case 'boolean':
      return `${value}`;
    case 'number':
      return `${value}`;
    case 'string':
      if (value.length > 80)
        value = `${value.substring(0, 77)}...`;
      return JSON.stringify(value);
    case 'symbol':
      return tryString(value);
    case 'function':
      return `[${funcName(value)}]`;
    case 'bigint':
      return `${value}n`;
    default:
      return `[${typeof value}]`;
  }
}

function toString(value) {
  if (typeof value === 'string')
    return value;

  if (isError(value))
    return tryString(value);

  return stringify(value);
}

function tryString(value) {
  try {
    return String(value);
  } catch (e) {
    return 'Object';
  }
}

/*
 * Error Testing
 */

function testError(err, expected, message, func) {
  if (expected == null)
    return true;

  if (isRegExp(expected))
    return expected.test(err);

  if (typeof expected !== 'function') {
    if (func === doesNotThrow || func === doesNotReject)
      throw new TypeError('"expected" must not be an object.');

    if (typeof expected !== 'object')
      throw new TypeError('"expected" must be an object.');

    let generatedMessage = false;

    if (message == null) {
      const name = func === rejects ? 'rejection' : 'exception';
      message = `Missing expected ${name}.`;
      generatedMessage = true;
    }

    if (err == null || typeof err !== 'object') {
      throw new AssertionError({
        actual: err,
        expected,
        message,
        operator: func.name,
        generatedMessage,
        stackStartFn: func
      });
    }

    const keys = Object.keys(expected);

    if (isError(expected))
      keys.push('name', 'message');

    if (keys.length === 0)
      throw new TypeError('"expected" may not be an empty object.');

    for (const key of keys) {
      const expect = expected[key];
      const value = err[key];

      if (typeof value === 'string'
          && isRegExp(expect)
          && expect.test(value)) {
        continue;
      }

      if ((key in err) && isDeepEqual(value, expect, false))
        continue;

      throw new AssertionError({
        actual: err,
        expected: expected,
        message,
        operator: func.name,
        generatedMessage,
        stackStartFn: func
      });
    }

    return true;
  }

  if (expected.prototype !== undefined && (err instanceof expected))
    return true;

  if (Error.isPrototypeOf(expected))
    return false;

  return expected.call({}, err) === true;
}

/*
 * Comparisons
 */

function isDeepEqual(x, y, fail) {
  try {
    return compare(x, y, null);
  } catch (e) {
    return fail;
  }
}

function compare(a, b, cache) {
  // Primitives.
  if (Object.is(a, b))
    return true;

  if (!isObject(a) || !isObject(b))
    return false;

  // Semi-primitives.
  if (objectString(a) !== objectString(b))
    return false;

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;

  if (isBuffer(a) && isBuffer(b))
    return a.equals(b);

  if (isDate(a))
    return Object.is(a.getTime(), b.getTime());

  if (isRegExp(a)) {
    return a.source === b.source
        && a.global === b.global
        && a.multiline === b.multiline
        && a.lastIndex === b.lastIndex
        && a.ignoreCase === b.ignoreCase;
  }

  if (isError(a)) {
    if (a.message !== b.message)
      return false;
  }

  if (isArrayBuffer(a)) {
    a = new Uint8Array(a);
    b = new Uint8Array(b);
  }

  if (isView(a) && !isBuffer(a)) {
    if (isBuffer(b))
      return false;

    const x = new Uint8Array(a.buffer);
    const y = new Uint8Array(b.buffer);

    if (x.length !== y.length)
      return false;

    for (let i = 0; i < x.length; i++) {
      if (x[i] !== y[i])
        return false;
    }

    return true;
  }

  if (isSet(a)) {
    if (a.size !== b.size)
      return false;

    const keys = new Set([...a, ...b]);

    return keys.size === a.size;
  }

  // Recursive.
  if (!cache) {
    cache = {
      a: new Map(),
      b: new Map(),
      p: 0
    };
  } else {
    const aa = cache.a.get(a);

    if (aa != null) {
      const bb = cache.b.get(b);
      if (bb != null)
        return aa === bb;
    }

    cache.p += 1;
  }

  cache.a.set(a, cache.p);
  cache.b.set(b, cache.p);

  const ret = recurse(a, b, cache);

  cache.a.delete(a);
  cache.b.delete(b);

  return ret;
}

function recurse(a, b, cache) {
  if (isMap(a)) {
    if (a.size !== b.size)
      return false;

    const keys = new Set([...a.keys(), ...b.keys()]);

    if (keys.size !== a.size)
      return false;

    for (const key of keys) {
      if (!compare(a.get(key), b.get(key), cache))
        return false;
    }

    return true;
  }

  if (isArray(a)) {
    if (a.length !== b.length)
      return false;

    for (let i = 0; i < a.length; i++) {
      if (!compare(a[i], b[i], cache))
        return false;
    }

    return true;
  }

  const ak = ownKeys(a);
  const bk = ownKeys(b);

  if (ak.length !== bk.length)
    return false;

  const keys = new Set([...ak, ...bk]);

  if (keys.size !== ak.length)
    return false;

  for (const key of keys) {
    if (!compare(a[key], b[key], cache))
      return false;
  }

  return true;
}

function ownKeys(obj) {
  const keys = Object.keys(obj);

  if (!Object.getOwnPropertySymbols)
    return keys;

  if (!Object.getOwnPropertyDescriptor)
    return keys;

  const symbols = Object.getOwnPropertySymbols(obj);

  for (const symbol of symbols) {
    const desc = Object.getOwnPropertyDescriptor(obj, symbol);

    if (desc && desc.enumerable)
      keys.push(symbol);
  }

  return keys;
}

/*
 * Helpers
 */

function objectString(obj) {
  if (obj === undefined)
    return '[object Undefined]';

  if (obj === null)
    return '[object Null]';

  try {
    return Object.prototype.toString.call(obj);
  } catch (e) {
    return '[object Object]';
  }
}

function objectType(obj) {
  return objectString(obj).slice(8, -1);
}

function objectName(obj) {
  const type = objectType(obj);

  if (obj == null)
    return type;

  if (type !== 'Object' && type !== 'Error')
    return type;

  let ctor, name;

  try {
    ctor = obj.constructor;
  } catch (e) {
    ;
  }

  if (ctor == null)
    return type;

  try {
    name = ctor.name;
  } catch (e) {
    return type;
  }

  if (typeof name !== 'string' || name.length === 0)
    return type;

  return name;
}

function funcName(func) {
  let name;

  try {
    name = func.name;
  } catch (e) {
    ;
  }

  if (typeof name !== 'string' || name.length === 0)
    return 'Function';

  return `Function: ${name}`;
}

function isArray(obj) {
  return Array.isArray(obj);
}

function isArrayBuffer(obj) {
  return obj instanceof ArrayBuffer;
}

function isBuffer(obj) {
  return isObject(obj)
      && typeof obj.writeUInt32LE === 'function'
      && typeof obj.equals === 'function';
}

function isDate(obj) {
  return obj instanceof Date;
}

function isError(obj) {
  return obj instanceof Error;
}

function isMap(obj) {
  return obj instanceof Map;
}

function isObject(obj) {
  return obj && typeof obj === 'object';
}

function isPromise(obj) {
  return obj instanceof Promise;
}

function isRegExp(obj) {
  return obj instanceof RegExp;
}

function isSet(obj) {
  return obj instanceof Set;
}

function isView(obj) {
  return ArrayBuffer.isView(obj);
}

function isEncoding(enc) {
  if (typeof enc !== 'string')
    return false;

  switch (enc) {
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'hex':
    case 'latin1':
    case 'ucs2':
    case 'utf8':
    case 'utf16le':
      return true;
  }

  return false;
}

function bufferize(actual, expected, enc) {
  if (typeof expected === 'string') {
    if (!isBuffer(actual))
      return null;

    const {constructor} = actual;

    if (!constructor || typeof constructor.from !== 'function')
      return null;

    if (!isEncoding(enc))
      return null;

    if (enc === 'hex' && (expected.length & 1))
      return null;

    const raw = constructor.from(expected, enc);

    if (enc === 'hex' && raw.length !== (expected.length >>> 1))
      return null;

    return raw;
  }

  return expected;
}

/*
 * API
 */

assert.AssertionError = AssertionError;
assert.assert = assert;
assert.strict = assert;
assert.ok = assert;
assert.equal = equal;
assert.notEqual = notEqual;
assert.strictEqual = equal;
assert.notStrictEqual = notEqual;
assert.fail = fail;
assert.throws = throws;
assert.doesNotThrow = doesNotThrow;
assert.rejects = rejects;
assert.doesNotReject = doesNotReject;
assert.ifError = ifError;
assert.deepEqual = deepEqual;
assert.notDeepEqual = notDeepEqual;
assert.deepStrictEqual = deepEqual;
assert.notDeepStrictEqual = notDeepEqual;
assert.bufferEqual = bufferEqual;
assert.notBufferEqual = notBufferEqual;
assert.enforce = enforce;
assert.range = range;

/*
 * Expose
 */

module.exports = assert;
}],
[/* 3 */ 'bcurl', '/lib/bcurl.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * bcurl.js - simple http client
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcurl
 */

'use strict';

const Client = __browser_require__(4 /* './client' */, module);

exports.Client = Client;
exports.client = options => new Client(options);
}],
[/* 4 */ 'bcurl', '/lib/client.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * client.js - http client for bcurl
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcurl
 */

'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);
const EventEmitter = __browser_require__(5 /* 'events' */, module);
const URL = __browser_require__(6 /* 'url' */, module);
const Path = __browser_require__(9 /* 'path' */, module).posix;
const bsock = __browser_require__(10 /* 'bsock' */, module);
const brq = __browser_require__(20 /* 'brq' */, module);

/**
 * HTTP Client
 */

class Client extends EventEmitter {
  /**
   * Create an HTTP client.
   * @constructor
   * @param {Object?} options
   */

  constructor(options) {
    super();

    const opt = new ClientOptions(options);

    this.ssl = opt.ssl;
    this.strictSSL = opt.strictSSL;
    this.host = opt.host;
    this.port = opt.port;
    this.path = opt.path;
    this.headers = opt.headers;
    this.username = opt.username;
    this.password = opt.password;
    this.id = opt.id;
    this.token = opt.token;
    this.timeout = opt.timeout;
    this.limit = opt.limit;
    this.sequence = 0;
    this.opened = false;
    this.socket = bsock.socket();
  }

  /**
   * Clone client.
   * @returns {Client}
   */

  clone() {
    const copy = new this.constructor();
    copy.ssl = this.ssl;
    copy.strictSSL = this.strictSSL;
    copy.host = this.host;
    copy.port = this.port;
    copy.path = this.path;
    copy.headers = this.headers;
    copy.username = this.username;
    copy.password = this.password;
    copy.id = this.id;
    copy.token = this.token;
    copy.sequence = this.sequence;
    copy.timeout = this.timeout;
    copy.limit = this.limit;
    copy.opened = this.opened;
    copy.socket = this.socket;
    return copy;
  }

  /**
   * Open client.
   * @returns {Promise}
   */

  async open() {
    const {port, host, ssl} = this;

    assert(!this.opened, 'Already opened.');
    this.opened = true;

    this.socket.on('connect', async () => {
      try {
        await this.auth();
      } catch (e) {
        this.emit('error', e);
        return;
      }
      this.emit('connect');
    });

    this.socket.on('error', (err) => {
      this.emit('error', err);
    });

    this.socket.on('disconnect', () => {
      this.emit('disconnect');
    });

    this.socket.connect(port, host, ssl);
  }

  /**
   * Close client.
   * @returns {Promise}
   */

  async close() {
    assert(this.opened, 'Not opened.');
    this.opened = false;
    this.socket.destroy();
    this.socket = bsock.socket();
  }

  /**
   * Auth (abstract).
   */

  async auth() {}

  /**
   * Add a hook.
   */

  hook(...args) {
    return this.socket.hook(...args);
  }

  /**
   * Remove a hook.
   */

  unhook(...args) {
    return this.socket.unhook(...args);
  }

  /**
   * Call a hook.
   * @returns {Promise}
   */

  async call(...args) {
    return this.socket.call(...args);
  }

  /**
   * Add an event listener.
   */

  bind(...args) {
    return this.socket.bind(...args);
  }

  /**
   * Remove an event listener.
   */

  unbind(...args) {
    return this.socket.unbind(...args);
  }

  /**
   * Fire an event.
   */

  fire(...args) {
    return this.socket.fire(...args);
  }

  /**
   * Make an http request to endpoint.
   * @param {String} method
   * @param {String} endpoint - Path.
   * @param {Object} params - Body or query depending on method.
   * @returns {Promise}
   */

  async request(method, endpoint, params) {
    assert(typeof method === 'string');
    assert(typeof endpoint === 'string');

    let query = null;

    if (params == null)
      params = {};

    assert(params && typeof params === 'object');

    if (this.token)
      params.token = this.token;

    if (method === 'GET') {
      query = params;
      params = null;
    }

    const res = await brq({
      method: method,
      ssl: this.ssl,
      strictSSL: this.strictSSL,
      host: this.host,
      port: this.port,
      path: Path.join(this.path, endpoint),
      username: this.username,
      password: this.password,
      headers: this.headers,
      timeout: this.timeout,
      limit: this.limit,
      query: query,
      pool: true,
      json: params
    });

    if (res.statusCode === 404)
      return null;

    if (res.statusCode === 401)
      throw new Error('Unauthorized (bad API key).');

    if (res.type !== 'json')
      throw new Error('Bad response (wrong content-type).');

    const json = res.json();

    if (!json)
      throw new Error('Bad response (no body).');

    if (json.error && res.statusCode >= 400) {
      const {error} = json;
      const err = new Error(error.message);
      err.type = String(error.type);
      err.code = error.code;
      throw err;
    }

    if (res.statusCode !== 200)
      throw new Error(`Status code: ${res.statusCode}.`);

    return json;
  }

  /**
   * Make a GET http request to endpoint.
   * @param {String} endpoint - Path.
   * @param {Object} params - Querystring.
   * @returns {Promise}
   */

  get(endpoint, params) {
    return this.request('GET', endpoint, params);
  }

  /**
   * Make a POST http request to endpoint.
   * @param {String} endpoint - Path.
   * @param {Object} params - Body.
   * @returns {Promise}
   */

  post(endpoint, params) {
    return this.request('POST', endpoint, params);
  }

  /**
   * Make a PUT http request to endpoint.
   * @param {String} endpoint - Path.
   * @param {Object} params - Body.
   * @returns {Promise}
   */

  put(endpoint, params) {
    return this.request('PUT', endpoint, params);
  }

  /**
   * Make a DELETE http request to endpoint.
   * @param {String} endpoint - Path.
   * @param {Object} params - Body.
   * @returns {Promise}
   */

  del(endpoint, params) {
    return this.request('DELETE', endpoint, params);
  }

  /**
   * Make a PATCH http request to endpoint.
   * @param {String} endpoint - Path.
   * @param {Object} params - Body.
   * @returns {Promise}
   */

  patch(endpoint, params) {
    return this.request('PATCH', endpoint, params);
  }

  /**
   * Make a json rpc request.
   * @param {String} endpoint - Path.
   * @param {String} method - RPC method name.
   * @param {Array} params - RPC parameters.
   * @returns {Promise} - Returns Object?.
   */

  async execute(endpoint, method, params) {
    assert(typeof endpoint === 'string');
    assert(typeof method === 'string');

    if (params == null)
      params = null;

    this.sequence += 1;

    const res = await brq({
      method: 'POST',
      ssl: this.ssl,
      strictSSL: this.strictSSL,
      host: this.host,
      port: this.port,
      path: Path.join(this.path, endpoint),
      username: this.username,
      password: this.password,
      headers: this.headers,
      timeout: this.timeout,
      limit: this.limit,
      pool: true,
      query: this.token
        ? { token: this.token }
        : undefined,
      json: {
        method: method,
        params: params,
        id: this.sequence
      }
    });

    if (res.statusCode === 401)
      throw new RPCError('Unauthorized (bad API key).', -1);

    if (res.type !== 'json')
      throw new Error('Bad response (wrong content-type).');

    const json = res.json();

    if (!json)
      throw new Error('No body for JSON-RPC response.');

    if (json.error) {
      const {message, code} = json.error;
      throw new RPCError(message, code);
    }

    if (res.statusCode !== 200)
      throw new Error(`Status code: ${res.statusCode}.`);

    return json.result;
  }
}

/**
 * Client Options
 */

class ClientOptions {
  constructor(options) {
    this.ssl = false;
    this.strictSSL = true;
    this.host = '127.0.0.1';
    this.port = 80;
    this.path = '/';
    this.headers = null;
    this.username = null;
    this.password = null;
    this.id = null;
    this.token = null;
    this.timeout = 5000;
    this.limit = null;

    if (options)
      this.fromOptions(options);
  }

  fromOptions(options) {
    if (typeof options === 'string')
      options = { url: options };

    assert(options && typeof options === 'object');

    if (options.ssl != null) {
      assert(typeof options.ssl === 'boolean');
      this.ssl = options.ssl;
      this.port = 443;
    }

    if (options.strictSSL != null) {
      assert(typeof options.strictSSL === 'boolean');
      this.strictSSL = options.strictSSL;
    }

    if (options.host != null) {
      assert(typeof options.host === 'string');
      this.host = options.host;
    }

    if (options.port != null) {
      assert((options.port & 0xffff) === options.port);
      assert(options.port !== 0);
      this.port = options.port;
    }

    if (options.path != null) {
      assert(typeof options.path === 'string');
      this.path = options.path;
    }

    if (options.headers != null) {
      assert(typeof options.headers === 'object');
      this.headers = options.headers;
    }

    if (options.apiKey != null) {
      assert(typeof options.apiKey === 'string');
      this.password = options.apiKey;
    }

    if (options.key != null) {
      assert(typeof options.key === 'string');
      this.password = options.key;
    }

    if (options.username != null) {
      assert(typeof options.username === 'string');
      this.username = options.username;
    }

    if (options.password != null) {
      assert(typeof options.password === 'string');
      this.password = options.password;
    }

    if (options.url != null) {
      assert(typeof options.url === 'string');

      let url = options.url;

      if (url.indexOf('://') === -1)
        url = `http://${url}`;

      const data = URL.parse(url);

      if (data.protocol !== 'http:'
          && data.protocol !== 'https:') {
        throw new Error('Malformed URL.');
      }

      if (!data.hostname)
        throw new Error('Malformed URL.');

      if (data.protocol === 'https:') {
        this.ssl = true;
        this.port = 443;
      }

      this.host = data.hostname;

      if (data.port) {
        const port = parseInt(data.port, 10);
        assert((port & 0xffff) === port);
        assert(port !== 0);
        this.port = port;
      }

      this.path = data.pathname;

      if (data.auth) {
        const parts = data.auth.split(':');
        this.username = parts.shift();
        this.password = parts.join(':');
      }
    }

    if (options.id != null) {
      assert(typeof options.id === 'string');
      this.id = options.id;
    }

    if (options.token != null) {
      assert(typeof options.token === 'string');
      this.token = options.token;
    }

    if (options.timeout != null) {
      assert(typeof options.timeout === 'number');
      this.timeout = options.timeout;
    }

    if (options.limit != null) {
      assert(typeof options.limit === 'number');
      this.limit = options.limit;
    }

    return this;
  }
}

/**
 * RPC Error
 */

class RPCError extends Error {
  constructor(msg, code) {
    super();

    this.type = 'RPCError';
    this.message = String(msg);
    this.code = code >> 0;

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, RPCError);
  }
}

/*
 * Expose
 */

module.exports = Client;
}],
[/* 5 */ 'bpkg', '/lib/builtins/events.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * events@3.0.0 - Node's event emitter for all engines.
 * Copyright (c) 2019, Irakli Gozalishvili (MIT)
 * https://github.com/Gozala/events#readme
 *
 * License for events@3.0.0:
 *
 * MIT
 *
 * Copyright Joyent, Inc. and other Node contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = $getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  var args = [];
  for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    ReflectApply(this.listener, this.target, args);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}
}],
[/* 6 */ 'bpkg', '/lib/builtins/url.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * url@0.11.0
 * https://github.com/defunctzombie/node-url#readme
 *
 * License for url@0.11.0:
 *
 * The MIT License (MIT)
 *
 * Copyright Joyent, Inc. and other Node contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var __node_modules__ = [
[/* 0 */ 'url', '/url.js', function(exports, module, __filename, __dirname, __meta) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = __browser_require__(7 /* 'punycode' */, module);
var util = __node_require__(1 /* './util' */);

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = __browser_require__(8 /* 'querystring' */, module);

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};
}],
[/* 1 */ 'url', '/util.js', function(exports, module, __filename, __dirname, __meta) {
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};
}]
];

var __node_cache__ = [];

function __node_error__(location) {
  var err = new Error('Cannot find module \'' + location + '\'');
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}

function __node_require__(id) {
  if ((id >>> 0) !== id || id > __node_modules__.length)
    return __node_error__(id);

  while (__node_cache__.length <= id)
    __node_cache__.push(null);

  var cache = __node_cache__[id];

  if (cache)
    return cache.exports;

  var mod = __node_modules__[id];
  var name = mod[0];
  var path = mod[1];
  var func = mod[2];
  var meta;

  var _exports = exports;
  var _module = module;

  if (id !== 0) {
    _exports = {};
    _module = {
      id: '/' + name + path,
      exports: _exports,
      parent: module.parent,
      filename: module.filename,
      loaded: false,
      children: module.children,
      paths: module.paths
    };
  }

  __node_cache__[id] = _module;

  try {
    func.call(_exports, _exports, _module,
              __filename, __dirname, meta);
  } catch (e) {
    __node_cache__[id] = null;
    throw e;
  }

  __node_modules__[id] = null;

  if (id !== 0)
    _module.loaded = true;

  return _module.exports;
}

__node_require__(0);
}],
[/* 7 */ 'bpkg', '/lib/builtins/punycode.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * punycode@2.1.1
 * Copyright (c) 2019, Mathias Bynens (MIT)
 * https://mths.be/punycode
 *
 * License for punycode@2.1.1:
 *
 * Copyright Mathias Bynens <https://mathiasbynens.be/>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

/** Highest positive signed 32-bit float value */
const maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128; // 0x80
const delimiter = '-'; // '\x2D'

/** Regular expressions */
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7E]/; // non-ASCII chars
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
const errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;

/*--------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */
function error(type) {
	throw new RangeError(errors[type]);
}

/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */
function map(array, fn) {
	const result = [];
	let length = array.length;
	while (length--) {
		result[length] = fn(array[length]);
	}
	return result;
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {Array} A new string of characters returned by the callback
 * function.
 */
function mapDomain(string, fn) {
	const parts = string.split('@');
	let result = '';
	if (parts.length > 1) {
		// In email addresses, only the domain name should be punycoded. Leave
		// the local part (i.e. everything up to `@`) intact.
		result = parts[0] + '@';
		string = parts[1];
	}
	// Avoid `split(regex)` for IE8 compatibility. See #17.
	string = string.replace(regexSeparators, '\x2E');
	const labels = string.split('.');
	const encoded = map(labels, fn).join('.');
	return result + encoded;
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @see `punycode.ucs2.encode`
 * @see <https://mathiasbynens.be/notes/javascript-encoding>
 * @memberOf punycode.ucs2
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @returns {Array} The new array of code points.
 */
function ucs2decode(string) {
	const output = [];
	let counter = 0;
	const length = string.length;
	while (counter < length) {
		const value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			const extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push(value);
				counter--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

/**
 * Creates a string based on an array of numeric code points.
 * @see `punycode.ucs2.decode`
 * @memberOf punycode.ucs2
 * @name encode
 * @param {Array} codePoints The array of numeric code points.
 * @returns {String} The new Unicode string (UCS-2).
 */
const ucs2encode = array => String.fromCodePoint(...array);

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param {Number} codePoint The basic numeric code point value.
 * @returns {Number} The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */
const basicToDigit = function(codePoint) {
	if (codePoint - 0x30 < 0x0A) {
		return codePoint - 0x16;
	}
	if (codePoint - 0x41 < 0x1A) {
		return codePoint - 0x41;
	}
	if (codePoint - 0x61 < 0x1A) {
		return codePoint - 0x61;
	}
	return base;
};

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param {Number} digit The numeric value of a basic code point.
 * @returns {Number} The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */
const digitToBasic = function(digit, flag) {
	//  0..25 map to ASCII a..z or A..Z
	// 26..35 map to ASCII 0..9
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
const adapt = function(delta, numPoints, firstTime) {
	let k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
		delta = floor(delta / baseMinusTMin);
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param {String} input The Punycode string of ASCII-only symbols.
 * @returns {String} The resulting string of Unicode symbols.
 */
const decode = function(input) {
	// Don't use UCS-2.
	const output = [];
	const inputLength = input.length;
	let i = 0;
	let n = initialN;
	let bias = initialBias;

	// Handle the basic code points: let `basic` be the number of input code
	// points before the last delimiter, or `0` if there is none, then copy
	// the first basic code points to the output.

	let basic = input.lastIndexOf(delimiter);
	if (basic < 0) {
		basic = 0;
	}

	for (let j = 0; j < basic; ++j) {
		// if it's not a basic code point
		if (input.charCodeAt(j) >= 0x80) {
			error('not-basic');
		}
		output.push(input.charCodeAt(j));
	}

	// Main decoding loop: start just after the last delimiter if any basic code
	// points were copied; start at the beginning otherwise.

	for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

		// `index` is the index of the next character to be consumed.
		// Decode a generalized variable-length integer into `delta`,
		// which gets added to `i`. The overflow checking is easier
		// if we increase `i` as we go, then subtract off its starting
		// value at the end to obtain `delta`.
		let oldi = i;
		for (let w = 1, k = base; /* no condition */; k += base) {

			if (index >= inputLength) {
				error('invalid-input');
			}

			const digit = basicToDigit(input.charCodeAt(index++));

			if (digit >= base || digit > floor((maxInt - i) / w)) {
				error('overflow');
			}

			i += digit * w;
			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

			if (digit < t) {
				break;
			}

			const baseMinusT = base - t;
			if (w > floor(maxInt / baseMinusT)) {
				error('overflow');
			}

			w *= baseMinusT;

		}

		const out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);

		// `i` was supposed to wrap around from `out` to `0`,
		// incrementing `n` each time, so we'll fix that now:
		if (floor(i / out) > maxInt - n) {
			error('overflow');
		}

		n += floor(i / out);
		i %= out;

		// Insert `n` at position `i` of the output.
		output.splice(i++, 0, n);

	}

	return String.fromCodePoint(...output);
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */
const encode = function(input) {
	const output = [];

	// Convert the input in UCS-2 to an array of Unicode code points.
	input = ucs2decode(input);

	// Cache the length.
	let inputLength = input.length;

	// Initialize the state.
	let n = initialN;
	let delta = 0;
	let bias = initialBias;

	// Handle the basic code points.
	for (const currentValue of input) {
		if (currentValue < 0x80) {
			output.push(stringFromCharCode(currentValue));
		}
	}

	let basicLength = output.length;
	let handledCPCount = basicLength;

	// `handledCPCount` is the number of code points that have been handled;
	// `basicLength` is the number of basic code points.

	// Finish the basic string with a delimiter unless it's empty.
	if (basicLength) {
		output.push(delimiter);
	}

	// Main encoding loop:
	while (handledCPCount < inputLength) {

		// All non-basic code points < n have been handled already. Find the next
		// larger one:
		let m = maxInt;
		for (const currentValue of input) {
			if (currentValue >= n && currentValue < m) {
				m = currentValue;
			}
		}

		// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
		// but guard against overflow.
		const handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
			error('overflow');
		}

		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		for (const currentValue of input) {
			if (currentValue < n && ++delta > maxInt) {
				error('overflow');
			}
			if (currentValue == n) {
				// Represent delta as a generalized variable-length integer.
				let q = delta;
				for (let k = base; /* no condition */; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) {
						break;
					}
					const qMinusT = q - t;
					const baseMinusT = base - t;
					output.push(
						stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
					);
					q = floor(qMinusT / baseMinusT);
				}

				output.push(stringFromCharCode(digitToBasic(q, 0)));
				bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
				delta = 0;
				++handledCPCount;
			}
		}

		++delta;
		++n;

	}
	return output.join('');
};

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 * @memberOf punycode
 * @param {String} input The Punycoded domain name or email address to
 * convert to Unicode.
 * @returns {String} The Unicode representation of the given Punycode
 * string.
 */
const toUnicode = function(input) {
	return mapDomain(input, function(string) {
		return regexPunycode.test(string)
			? decode(string.slice(4).toLowerCase())
			: string;
	});
};

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @memberOf punycode
 * @param {String} input The domain name or email address to convert, as a
 * Unicode string.
 * @returns {String} The Punycode representation of the given domain name or
 * email address.
 */
const toASCII = function(input) {
	return mapDomain(input, function(string) {
		return regexNonASCII.test(string)
			? 'xn--' + encode(string)
			: string;
	});
};

/*--------------------------------------------------------------------------*/

/** Define the public API */
const punycode = {
	/**
	 * A string representing the current Punycode.js version number.
	 * @memberOf punycode
	 * @type String
	 */
	'version': '2.1.0',
	/**
	 * An object of methods to convert from JavaScript's internal character
	 * representation (UCS-2) to Unicode code points, and back.
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode
	 * @type Object
	 */
	'ucs2': {
		'decode': ucs2decode,
		'encode': ucs2encode
	},
	'decode': decode,
	'encode': encode,
	'toASCII': toASCII,
	'toUnicode': toUnicode
};

module.exports = punycode;
}],
[/* 8 */ 'bpkg', '/lib/builtins/querystring.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * querystring@0.2.0 - Node's querystring module for all engines.
 * Copyright (c) 2019, Irakli Gozalishvili
 * https://github.com/Gozala/querystring#readme
 *
 * License for querystring@0.2.0:
 *
 * Copyright 2012 Irakli Gozalishvili. All rights reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

var __node_modules__ = [
[/* 0 */ 'querystring', '/index.js', function(exports, module, __filename, __dirname, __meta) {
'use strict';

exports.decode = exports.parse = __node_require__(1 /* './decode' */);
exports.encode = exports.stringify = __node_require__(2 /* './encode' */);
}],
[/* 1 */ 'querystring', '/decode.js', function(exports, module, __filename, __dirname, __meta) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};
}],
[/* 2 */ 'querystring', '/encode.js', function(exports, module, __filename, __dirname, __meta) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};
}]
];

var __node_cache__ = [];

function __node_error__(location) {
  var err = new Error('Cannot find module \'' + location + '\'');
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}

function __node_require__(id) {
  if ((id >>> 0) !== id || id > __node_modules__.length)
    return __node_error__(id);

  while (__node_cache__.length <= id)
    __node_cache__.push(null);

  var cache = __node_cache__[id];

  if (cache)
    return cache.exports;

  var mod = __node_modules__[id];
  var name = mod[0];
  var path = mod[1];
  var func = mod[2];
  var meta;

  var _exports = exports;
  var _module = module;

  if (id !== 0) {
    _exports = {};
    _module = {
      id: '/' + name + path,
      exports: _exports,
      parent: module.parent,
      filename: module.filename,
      loaded: false,
      children: module.children,
      paths: module.paths
    };
  }

  __node_cache__[id] = _module;

  try {
    func.call(_exports, _exports, _module,
              __filename, __dirname, meta);
  } catch (e) {
    __node_cache__[id] = null;
    throw e;
  }

  __node_modules__[id] = null;

  if (id !== 0)
    _module.loaded = true;

  return _module.exports;
}

__node_require__(0);
}],
[/* 9 */ 'bpkg', '/lib/builtins/path.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * path-browserify@1.0.0 - the path module from node core for browsers
 * Copyright (c) 2019, James Halliday (MIT)
 * https://github.com/browserify/path-browserify
 *
 * License for path-browserify@1.0.0:
 *
 * This software is released under the MIT license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;
}],
[/* 10 */ 'bsock', '/lib/bsock.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

const WebSocket = __browser_require__(11 /* './backend' */, module);
const Server = __browser_require__(12 /* './server' */, module);
const Socket = __browser_require__(13 /* './socket' */, module);

exports.WebSocket = WebSocket;
exports.Server = Server;
exports.server = () => new Server();
exports.createServer = Server.createServer.bind(Server);
exports.attach = Server.attach.bind(Server);
exports.Socket = Socket;
exports.socket = () => new Socket();
exports.connect = Socket.connect.bind(Socket);
}],
[/* 11 */ 'bsock', '/lib/backend-browser.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

module.exports = {
  Client: global.WebSocket || global.MozWebSocket,
  EventSource: global.EventSource
};
}],
[/* 12 */ 'bsock', '/lib/server-browser.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

const EventEmitter = __browser_require__(5 /* 'events' */, module);

class Server extends EventEmitter {
  constructor(options) {
    super();

    this.sockets = new Set();
    this.channels = new Map();
    this.mounts = [];
  }

  attach() {
    return this;
  }

  mount() {}

  async open() {}

  async close() {}

  join() {
    return true;
  }

  leave() {
    return true;
  }

  channel() {
    return null;
  }

  to() {}

  all() {}

  static attach(parent, options) {
    const server = new this(options);
    return server.attach(parent);
  }

  static createServer(options) {
    return new this(options);
  }
}

module.exports = Server;
}],
[/* 13 */ 'bsock', '/lib/socket.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

/* global Blob, FileReader */

const assert = __browser_require__(2 /* 'bsert' */, module);
const EventEmitter = __browser_require__(5 /* 'events' */, module);
const WebSocket = __browser_require__(11 /* './backend' */, module).Client;
const Packet = __browser_require__(14 /* './packet' */, module);
const Frame = __browser_require__(15 /* './frame' */, module);
const util = __browser_require__(16 /* './util' */, module);
const Parser = __browser_require__(17 /* './parser' */, module);
const codes = __browser_require__(18 /* './codes' */, module);
const blacklist = __browser_require__(19 /* './blacklist' */, module);

/**
 * Socket
 */

class Socket extends EventEmitter {
  constructor() {
    super();

    this.server = null;
    this.ws = null;
    this.protocol = '';
    this.url = 'ws://127.0.0.1:80/socket.io/?transport=websocket';
    this.ssl = false;
    this.host = '127.0.0.1';
    this.port = 80;
    this.inbound = false;
    this.handshake = false;
    this.opened = false;
    this.connected = false;
    this.challenge = false;
    this.destroyed = false;
    this.reconnection = true;

    this.time = 0;
    this.sequence = 0;
    this.pingInterval = 25000;
    this.pingTimeout = 60000;
    this.lastPing = 0;

    this.parser = new Parser();
    this.binary = false;

    this.packet = null;
    this.timer = null;
    this.jobs = new Map();
    this.hooks = new Map();
    this.channels = new Set();
    this.events = new EventEmitter();
    this.buffer = [];

    // Unused.
    this.admin = false;
    this.auth = false;
  }

  accept(server, req, socket, ws) {
    assert(!this.ws, 'Cannot accept twice.');

    assert(server);
    assert(req);
    assert(socket);
    assert(socket.remoteAddress);
    assert(socket.remotePort != null);
    assert(ws);

    let proto = 'ws';
    let host = socket.remoteAddress;
    let port = socket.remotePort;

    if (socket.encrypted)
      proto = 'wss';

    if (host.indexOf(':') !== -1)
      host = `[${host}]`;

    if (!port)
      port = 0;

    this.server = server;
    this.binary = req.url.indexOf('b64=1') === -1;
    this.url = `${proto}://${host}:${port}/socket.io/?transport=websocket`;
    this.ssl = proto === 'wss';
    this.host = socket.remoteAddress;
    this.port = socket.remotePort;
    this.inbound = true;
    this.ws = ws;

    this.init();

    return this;
  }

  connect(port, host, ssl, protocols) {
    assert(!this.ws, 'Cannot connect twice.');

    if (typeof port === 'string') {
      protocols = host;
      [port, host, ssl] = util.parseURL(port);
    }

    let proto = 'ws';

    if (ssl)
      proto = 'wss';

    if (!host)
      host = '127.0.0.1';

    assert(typeof host === 'string');
    assert((port & 0xffff) === port, 'Must pass a port.');
    assert(!ssl || typeof ssl === 'boolean');
    assert(!protocols || Array.isArray(protocols));

    let hostname = host;
    if (host.indexOf(':') !== -1 && host[0] !== '[')
      hostname = `[${host}]`;

    const path = '/socket.io';
    const qs = '?transport=websocket';
    const url = `${proto}://${hostname}:${port}${path}/${qs}`;

    this.binary = true;
    this.url = url;
    this.ssl = ssl;
    this.host = host;
    this.port = port;
    this.inbound = false;
    this.ws = new WebSocket(url, protocols);

    this.init();

    return this;
  }

  init() {
    this.protocol = this.ws.protocol;
    this.time = Date.now();
    this.observe();

    this.parser.on('error', (err) => {
      this.emit('error', err);
    });

    this.parser.on('frame', async (frame) => {
      try {
        await this.handleFrame(frame);
      } catch (e) {
        this.emit('error', e);
      }
    });

    this.start();
  }

  observe() {
    const ws = this.ws;
    assert(ws);

    ws.binaryType = 'arraybuffer';

    ws.onopen = async () => {
      await this.onOpen();
    };

    ws.onmessage = async (event) => {
      await this.onMessage(event);
    };

    ws.onerror = async (event) => {
      await this.onError(event);
    };

    ws.onclose = async (event) => {
      await this.onClose(event);
    };
  }

  async onOpen() {
    if (this.destroyed)
      return;

    if (!this.inbound)
      return;

    assert(!this.opened);
    assert(!this.connected);
    assert(!this.handshake);

    this.opened = true;
    this.handshake = true;

    await this.emitAsync('open');

    this.sendHandshake();

    this.connected = true;
    await this.emitAsync('connect');

    this.sendConnect();
  }

  async emitAsync(event, ...args) {
    const handlers = this.listeners(event);

    for (const handler of handlers) {
      try {
        await handler(...args);
      } catch (e) {
        this.emit('error', e);
      }
    }
  }

  async onMessage(event) {
    if (this.destroyed)
      return;

    let data;

    try {
      data = await readBinary(event.data);
    } catch (e) {
      this.emit('error', e);
      return;
    }

    // Textual frame.
    if (typeof data === 'string') {
      this.parser.feedString(data);
      return;
    }

    // Binary frame.
    this.parser.feedBinary(data);
  }

  async onError(event) {
    if (this.destroyed)
      return;

    this.emit('error', new Error(event.message));

    if (this.inbound) {
      this.destroy();
      return;
    }

    this.close();
  }

  async onClose(event) {
    if (this.destroyed)
      return;

    if (event.code === 1000 || event.code === 1001) {
      if (!this.connected)
        this.emit('error', new Error('Could not connect.'));

      if (this.inbound) {
        this.destroy();
        return;
      }

      this.close();

      return;
    }

    const code = codes[event.code] || 'UNKNOWN_CODE';
    const reason = event.reason || 'Unknown reason';
    const msg = `Websocket Closed: ${reason} (code=${code}).`;

    const err = new Error(msg);
    err.reason = event.reason || '';
    err.code = event.code || 0;

    this.emit('error', err);

    if (this.inbound) {
      this.destroy();
      return;
    }

    if (!this.reconnection) {
      this.destroy();
      return;
    }

    this.close();
  }

  close() {
    if (this.destroyed)
      return;

    this.time = Date.now();
    this.packet = null;
    this.handshake = false;
    this.connected = false;
    this.challenge = false;
    this.sequence = 0;
    this.lastPing = 0;

    for (const [id, job] of this.jobs) {
      this.jobs.delete(id);
      job.reject(new Error('Job timed out.'));
    }

    assert(this.ws);
    this.ws.onopen = () => {};
    this.ws.onmessage = () => {};
    this.ws.onerror = () => {};
    this.ws.onclose = () => {};
    this.ws.close();

    this.emitAsync('disconnect');
  }

  error(msg) {
    if (this.destroyed)
      return;

    this.emit('error', new Error(msg));
  }

  destroy() {
    if (this.destroyed)
      return;

    this.close();
    this.stop();

    this.opened = false;
    this.destroyed = true;
    this.buffer.length = 0;

    this.emitAsync('close');

    this.removeAllListeners();
    this.on('error', () => {});
  }

  send(frame) {
    if (this.destroyed)
      return;

    assert(this.ws);

    if (frame.binary && this.binary)
      this.ws.send(frame.toRaw());
    else
      this.ws.send(frame.toString());
  }

  reconnect() {
    assert(!this.inbound);
    this.close();
    this.ws = new WebSocket(this.url);
    this.time = Date.now();
    this.observe();
  }

  start() {
    assert(this.ws);
    assert(this.timer == null);
    this.timer = setInterval(() => this.stall(), 5000);
  }

  stop() {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  stall() {
    const now = Date.now();

    assert(this.ws);

    if (!this.connected) {
      if (now - this.time > 10000) {
        if (this.inbound || !this.reconnection) {
          this.error('Timed out waiting for connection.');
          this.destroy();
          return;
        }

        this.error('Timed out waiting for connection. Reconnecting...');
        this.reconnect();

        return;
      }

      return;
    }

    for (const [id, job] of this.jobs) {
      if (now - job.time > 600000) {
        this.jobs.delete(id);
        job.reject(new Error('Job timed out.'));
      }
    }

    if (!this.inbound && !this.challenge) {
      this.challenge = true;
      this.lastPing = now;
      this.sendPing();
      return;
    }

    if (!this.inbound && now - this.lastPing > this.pingTimeout) {
      this.error('Connection is stalling (ping).');

      if (this.inbound) {
        this.destroy();
        return;
      }

      this.close();

      return;
    }
  }

  /*
   * Frames
   */

  async handleFrame(frame) {
    if (this.destroyed)
      return undefined;

    switch (frame.type) {
      case Frame.types.OPEN:
        return this.handleOpen(frame);
      case Frame.types.CLOSE:
        return this.handleClose(frame);
      case Frame.types.PING:
        return this.handlePing(frame);
      case Frame.types.PONG:
        return this.handlePong(frame);
      case Frame.types.MESSAGE:
        return this.handleMessage(frame);
      case Frame.types.UPGRADE:
        return this.handleUpgrade(frame);
      case Frame.types.NOOP:
        return this.handleNoop(frame);
      default: {
        throw new Error('Unknown frame.');
      }
    }
  }

  async handleOpen(frame) {
    if (this.inbound)
      throw new Error('Inbound socket sent an open frame.');

    if (frame.binary)
      throw new Error('Received a binary open frame.');

    if (this.handshake)
      throw new Error('Duplicate open frame.');

    const json = JSON.parse(frame.data);

    enforce(json && typeof json === 'object', 'open', 'object');

    const {pingInterval, pingTimeout} = json;

    enforce((pingInterval >>> 0) === pingInterval, 'interval', 'uint32');
    enforce((pingTimeout >>> 0) === pingTimeout, 'timeout', 'uint32');

    this.pingInterval = pingInterval;
    this.pingTimeout = pingTimeout;
    this.handshake = true;

    if (!this.opened) {
      this.opened = true;
      await this.emitAsync('open');
    }
  }

  async handleClose(frame) {
    if (this.inbound)
      throw new Error('Inbound socket sent a close frame.');

    this.close();
  }

  async handlePing() {
    if (!this.inbound)
      throw new Error('Outbound socket sent a ping frame.');

    this.sendPong();
  }

  async handlePong() {
    if (this.inbound)
      throw new Error('Inbound socket sent a pong frame.');

    if (!this.challenge) {
      this.error('Remote node sent bad pong.');
      this.destroy();
      return;
    }

    this.challenge = false;
  }

  async handleMessage(frame) {
    if (this.packet) {
      const packet = this.packet;

      if (!frame.binary)
        throw new Error('Received non-binary frame as attachment.');

      packet.buffers.push(frame.data);

      if (packet.buffers.length === packet.attachments) {
        this.packet = null;
        return this.handlePacket(packet);
      }

      return undefined;
    }

    if (frame.binary)
      throw new Error('Received binary frame as a message.');

    const packet = Packet.fromString(frame.data);

    if (packet.attachments > 0) {
      this.packet = packet;
      return undefined;
    }

    return this.handlePacket(packet);
  }

  async handleUpgrade(frame) {
    if (!this.inbound)
      throw new Error('Outbound socket sent an upgrade frame.');
    throw new Error('Cannot upgrade from websocket.');
  }

  async handleNoop(frame) {
    ;
  }

  sendFrame(type, data, binary) {
    this.send(new Frame(type, data, binary));
  }

  sendOpen(data) {
    this.sendFrame(Frame.types.OPEN, data, false);
  }

  sendClose(data) {
    this.sendFrame(Frame.types.CLOSE, data, false);
  }

  sendPing(data) {
    this.sendFrame(Frame.types.PING, data, false);
  }

  sendPong(data) {
    this.sendFrame(Frame.types.PONG, data, false);
  }

  sendMessage(data) {
    this.sendFrame(Frame.types.MESSAGE, data, false);
  }

  sendBinary(data) {
    this.sendFrame(Frame.types.MESSAGE, data, true);
  }

  sendHandshake() {
    const handshake = JSON.stringify({
      sid: '00000000000000000000',
      upgrades: [],
      pingInterval: this.pingInterval,
      pingTimeout: this.pingTimeout
    });

    this.sendOpen(handshake);
  }

  /*
   * Packets
   */

  async handlePacket(packet) {
    if (this.destroyed)
      return undefined;

    switch (packet.type) {
      case Packet.types.CONNECT: {
        return this.handleConnect();
      }
      case Packet.types.DISCONNECT: {
        return this.handleDisconnect();
      }
      case Packet.types.EVENT:
      case Packet.types.BINARY_EVENT: {
        const args = packet.getData();

        enforce(Array.isArray(args), 'args', 'array');
        enforce(args.length > 0, 'args', 'array');
        enforce(typeof args[0] === 'string', 'event', 'string');

        if (packet.id !== -1)
          return this.handleCall(packet.id, args);

        return this.handleEvent(args);
      }
      case Packet.types.ACK:
      case Packet.types.BINARY_ACK: {
        enforce(packet.id !== -1, 'id', 'uint32');

        const json = packet.getData();

        enforce(json == null || Array.isArray(json), 'args', 'array');

        let err = null;
        let result = null;

        if (json && json.length > 0)
          err = json[0];

        if (json && json.length > 1)
          result = json[1];

        if (result == null)
          result = null;

        if (err) {
          enforce(typeof err === 'object', 'error', 'object');
          return this.handleError(packet.id, err);
        }

        return this.handleAck(packet.id, result);
      }
      case Packet.types.ERROR: {
        const err = packet.getData();
        enforce(err && typeof err === 'object', 'error', 'object');
        return this.handleError(-1, err);
      }
      default: {
        throw new Error('Unknown packet.');
      }
    }
  }

  async handleConnect() {
    if (this.inbound)
      throw new Error('Inbound socket sent connect packet.');

    this.connected = true;

    await this.emitAsync('connect');

    for (const packet of this.buffer)
      this.sendPacket(packet);

    this.buffer.length = 0;
  }

  async handleDisconnect() {
    this.close();
  }

  async handleEvent(args) {
    try {
      const event = args[0];

      if (blacklist.hasOwnProperty(event))
        throw new Error(`Cannot emit blacklisted event: ${event}.`);

      this.events.emit(...args);
    } catch (e) {
      this.emit('error', e);
      this.sendError(-1, e);
    }
  }

  async handleCall(id, args) {
    let result;

    try {
      const event = args.shift();

      if (blacklist.hasOwnProperty(event))
        throw new Error(`Cannot emit blacklisted event: ${event}.`);

      const handler = this.hooks.get(event);

      if (!handler)
        throw new Error(`Call not found: ${event}.`);

      result = await handler(...args);
    } catch (e) {
      this.emit('error', e);
      this.sendError(id, e);
      return;
    }

    if (result == null)
      result = null;

    this.sendAck(id, result);
  }

  async handleAck(id, data) {
    const job = this.jobs.get(id);

    if (!job)
      throw new Error(`Job not found for ${id}.`);

    this.jobs.delete(id);

    job.resolve(data);
  }

  async handleError(id, err) {
    const msg = castMsg(err.message);
    const name = castString(err.name);
    const type = castString(err.type);
    const code = castCode(err.code);

    if (id === -1) {
      const e = new Error(msg);
      e.name = name;
      e.type = type;
      e.code = code;
      this.emit('error', e);
      return;
    }

    const job = this.jobs.get(id);

    if (!job)
      throw new Error(`Job not found for ${id}.`);

    this.jobs.delete(id);

    const e = new Error(msg);
    e.name = name;
    e.type = type;
    e.code = code;

    job.reject(e);
  }

  sendPacket(packet) {
    this.sendMessage(packet.toString());

    for (const data of packet.buffers)
      this.sendBinary(data);
  }

  sendConnect() {
    this.sendPacket(new Packet(Packet.types.CONNECT));
  }

  sendDisconnect() {
    this.sendPacket(new Packet(Packet.types.DISCONNECT));
  }

  sendEvent(data) {
    const packet = new Packet();

    packet.type = Packet.types.EVENT;
    packet.setData(data);

    if (!this.connected) {
      this.buffer.push(packet);
      return;
    }

    this.sendPacket(packet);
  }

  sendCall(id, data) {
    const packet = new Packet();

    packet.type = Packet.types.EVENT;
    packet.id = id;
    packet.setData(data);

    if (!this.connected) {
      this.buffer.push(packet);
      return;
    }

    this.sendPacket(packet);
  }

  sendAck(id, data) {
    const packet = new Packet();
    packet.type = Packet.types.ACK;
    packet.id = id;
    packet.setData([null, data]);
    this.sendPacket(packet);
  }

  sendError(id, err) {
    const message = castMsg(err.message);
    const name = castString(err.name);
    const type = castString(err.type);
    const code = castCode(err.code);

    if (id === -1) {
      const packet = new Packet();
      packet.type = Packet.types.ERROR;
      packet.setData({ message, name, type, code });
      this.sendPacket(packet);
      return;
    }

    const packet = new Packet();
    packet.type = Packet.types.ACK;
    packet.id = id;
    packet.setData([{ message, name, type, code }]);
    this.sendPacket(packet);
  }

  /*
   * API
   */

  bind(event, handler) {
    enforce(typeof event === 'string', 'event', 'string');
    enforce(typeof handler === 'function', 'handler', 'function');
    assert(!blacklist.hasOwnProperty(event), 'Blacklisted event.');
    this.events.on(event, handler);
  }

  unbind(event, handler) {
    enforce(typeof event === 'string', 'event', 'string');
    enforce(typeof handler === 'function', 'handler', 'function');
    assert(!blacklist.hasOwnProperty(event), 'Blacklisted event.');
    this.events.removeListener(event, handler);
  }

  fire(...args) {
    enforce(args.length > 0, 'event', 'string');
    enforce(typeof args[0] === 'string', 'event', 'string');
    this.sendEvent(args);
  }

  hook(event, handler) {
    enforce(typeof event === 'string', 'event', 'string');
    enforce(typeof handler === 'function', 'handler', 'function');
    assert(!this.hooks.has(event), 'Hook already bound.');
    assert(!blacklist.hasOwnProperty(event), 'Blacklisted event.');
    this.hooks.set(event, handler);
  }

  unhook(event) {
    enforce(typeof event === 'string', 'event', 'string');
    assert(!blacklist.hasOwnProperty(event), 'Blacklisted event.');
    this.hooks.delete(event);
  }

  call(...args) {
    enforce(args.length > 0, 'event', 'string');
    enforce(typeof args[0] === 'string', 'event', 'string');

    const id = this.sequence;

    this.sequence += 1;
    this.sequence >>>= 0;

    assert(!this.jobs.has(id), 'ID collision.');

    this.sendCall(id, args);

    return new Promise((resolve, reject) => {
      this.jobs.set(id, new Job(resolve, reject, Date.now()));
    });
  }

  channel(name) {
    return this.channels.has(name);
  }

  join(name) {
    if (!this.server)
      return false;
    return this.server.join(this, name);
  }

  leave(name) {
    if (!this.server)
      return false;
    return this.server.leave(this, name);
  }

  static accept(server, req, socket, ws) {
    return new this().accept(server, req, socket, ws);
  }

  static connect(port, host, ssl, protocols) {
    return new this().connect(port, host, ssl, protocols);
  }
}

/*
 * Helpers
 */

class Job {
  constructor(resolve, reject, time) {
    this.resolve = resolve;
    this.reject = reject;
    this.time = time;
  }
}

function castCode(code) {
  if (code !== null
      && typeof code !== 'number'
      && typeof code !== 'string') {
    return null;
  }
  return code;
}

function castMsg(msg) {
  if (typeof msg !== 'string')
    return 'No message.';
  return msg;
}

function castString(type) {
  if (typeof type !== 'string')
    return null;
  return type;
}

function enforce(value, name, type) {
  if (!value) {
    const err = new TypeError(`'${name}' must be a(n) ${type}.`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(err, enforce);
    throw err;
  }
}

function readBinary(data) {
  return new Promise((resolve, reject) => {
    if (typeof data === 'string') {
      resolve(data);
      return;
    }

    if (!data || typeof data !== 'object') {
      reject(new Error('Bad data object.'));
      return;
    }

    if ((data != null && data._isBuffer === true)) {
      resolve(data);
      return;
    }

    if (data instanceof ArrayBuffer) {
      const result = Buffer.from(data);
      resolve(result);
      return;
    }

    if (data.buffer instanceof ArrayBuffer) {
      const result = Buffer.from(data.buffer,
                                 data.byteOffset,
                                 data.byteLength);
      resolve(result);
      return;
    }

    if (typeof Blob !== 'undefined' && Blob) {
      if (data instanceof Blob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = Buffer.from(reader.result);
          resolve(result);
        };
        reader.readAsArrayBuffer(data);
        return;
      }
    }

    reject(new Error('Bad data object.'));
  });
}

/*
 * Expose
 */

module.exports = Socket;
}],
[/* 14 */ 'bsock', '/lib/packet.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);

const types = {
  CONNECT: 0,
  DISCONNECT: 1,
  EVENT: 2,
  ACK: 3,
  ERROR: 4,
  BINARY_EVENT: 5,
  BINARY_ACK: 6
};

class Packet {
  constructor(type) {
    this.type = type || 0;
    this.attachments = 0;
    this.nsp = '/';
    this.id = -1;
    this.data = '';
    this.buffers = [];
  }

  setData(data) {
    assert(data !== undefined);
    assert(typeof data !== 'number');
    assert(typeof data !== 'function');

    const [str, buffers] = deconstruct(data);

    this.data = str;
    this.buffers = buffers;
    this.attachments = buffers.length;

    if (this.attachments > 0) {
      switch (this.type) {
        case types.EVENT:
          this.type = types.BINARY_EVENT;
          break;
        case types.ACK:
          this.type = types.BINARY_ACK;
          break;
      }
    }

    return this;
  }

  getData() {
    if (this.data.length === 0)
      return null;
    return reconstruct(this.data, this.buffers);
  }

  toString() {
    let str = this.type.toString(10);

    switch (this.type) {
      case types.BINARY_EVENT:
      case types.BINARY_ACK:
        str += this.attachments.toString(10) + '-';
        break;
    }

    if (this.nsp !== '/')
      str += this.nsp + ',';

    if (this.id !== -1)
      str += this.id.toString(10);

    str += this.data;

    return str;
  }

  static fromString(str) {
    assert(typeof str === 'string');
    assert(str.length > 0);

    let i = 0;
    let type = 0;
    let attachments = 0;
    let nsp = '/';
    let id = -1;
    let data = '';

    [i, type] = readChar(str, i);

    assert(type !== -1);
    assert(type <= types.BINARY_ACK);

    switch (type) {
      case types.BINARY_EVENT:
      case types.BINARY_ACK: {
        [i, attachments] = readInt(str, i);
        assert(attachments !== -1);
        assert(i < str.length);
        assert(str[i] === '-');
        i += 1;
        break;
      }
    }

    if (i < str.length && str[i] === '/')
      [i, nsp] = readTo(str, i, ',');

    [i, id] = readInt(str, i);

    if (i < str.length)
      data = str.substring(i);

    const packet = new this();

    packet.type = type;
    packet.attachments = attachments;
    packet.nsp = nsp;
    packet.id = id;
    packet.data = data;

    return packet;
  }
}

Packet.types = types;

function isPlaceholder(obj) {
  return obj !== null
    && typeof obj === 'object'
    && obj._placeholder === true
    && (obj.num >>> 0) === obj.num;
}

function deconstruct(obj) {
  const buffers = [];
  const out = replace('', obj, buffers, new Map());
  const str = JSON.stringify(out);
  return [str, buffers];
}

function replace(key, value, buffers, seen) {
  if (value === null || typeof value !== 'object')
    return value;

  if ((value != null && value._isBuffer === true)) {
    const placeholder = seen.get(value);

    // De-duplicate.
    if (placeholder != null)
      return placeholder;

    const out = { _placeholder: true, num: buffers.length };

    seen.set(value, out);
    buffers.push(value);

    return out;
  }

  if (seen.has(value))
    throw new TypeError('Converting circular structure to JSON.');

  if (Array.isArray(value)) {
    const out = [];

    seen.set(value, null);

    for (let i = 0; i < value.length; i++)
      out.push(replace(i, value[i], buffers, seen));

    seen.delete(value);

    return out;
  }

  const out = Object.create(null);

  const json = typeof value.toJSON === 'function'
    ? value.toJSON(key)
    : value;

  seen.set(value, null);

  for (const key of Object.keys(json))
    out[key] = replace(key, json[key], buffers, seen);

  seen.delete(value);

  return out;
}

function reconstruct(str, buffers) {
  return JSON.parse(str, (key, value) => {
    if (isPlaceholder(value)) {
      if (value.num < buffers.length)
        return buffers[value.num];
    }
    return value;
  });
}

function readChar(str, i) {
  const ch = str.charCodeAt(i) - 0x30;

  if (ch < 0 || ch > 9)
    return -1;

  return [i + 1, ch];
}

function readInt(str, i) {
  let len = 0;
  let num = 0;

  for (; i < str.length; i++) {
    const ch = str.charCodeAt(i) - 0x30;

    if (ch < 0 || ch > 9)
      break;

    num *= 10;
    num += ch;
    len += 1;

    assert(len <= 10);
  }

  assert(num <= 0xffffffff);

  if (len === 0)
    num = -1;

  return [i, num];
}

function readTo(str, i, ch) {
  let j = i;

  for (; j < str.length; j++) {
    if (str[j] === ch)
      break;
  }

  assert(j < str.length);

  return [j + 1, str.substring(i, j)];
}

/*
 * Expose
 */

module.exports = Packet;
}],
[/* 15 */ 'bsock', '/lib/frame.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);
const DUMMY = Buffer.alloc(0);

const types = {
  OPEN: 0,
  CLOSE: 1,
  PING: 2,
  PONG: 3,
  MESSAGE: 4,
  UPGRADE: 5,
  NOOP: 6
};

const table = [
  'open',
  'close',
  'ping',
  'pong',
  'message',
  'upgrade',
  'noop'
];

class Frame {
  constructor(type, data, binary) {
    assert(typeof type === 'number');
    assert((type >>> 0) === type);
    assert(type <= types.NOOP);
    assert(typeof binary === 'boolean');

    if (binary) {
      if (data == null)
        data = DUMMY;
      assert((data != null && data._isBuffer === true));
    } else {
      if (data == null)
        data = '';
      assert(typeof data === 'string');
    }

    this.type = type;
    this.data = data;
    this.binary = binary;
  }

  toString() {
    let str = '';

    if (this.binary) {
      str += 'b';
      str += this.type.toString(10);
      str += this.data.toString('base64');
    } else {
      str += this.type.toString(10);
      str += this.data;
    }

    return str;
  }

  static fromString(str) {
    assert(typeof str === 'string');

    let type = str.charCodeAt(0);
    let binary = false;
    let data;

    // 'b' - base64
    if (type === 0x62) {
      assert(str.length > 1);
      type = str.charCodeAt(1);
      data = Buffer.from(str.substring(2), 'base64');
      binary = true;
    } else {
      data = str.substring(1);
    }

    type -= 0x30;
    assert(type >= 0 && type <= 9);
    assert(type <= types.NOOP);

    return new this(type, data, binary);
  }

  size() {
    let len = 1;

    if (this.binary)
      len += this.data.length;
    else
      len += Buffer.byteLength(this.data, 'utf8');

    return len;
  }

  toRaw() {
    const data = Buffer.allocUnsafe(this.size());

    data[0] = this.type;

    if (this.binary) {
      this.data.copy(data, 1);
    } else {
      if (this.data.length > 0)
        data.write(this.data, 1, 'utf8');
    }

    return data;
  }

  static fromRaw(data) {
    assert((data != null && data._isBuffer === true));
    assert(data.length > 0);

    const type = data[0];
    assert(type <= types.NOOP);

    return new this(type, data.slice(1), true);
  }
}

Frame.types = types;
Frame.table = table;

module.exports = Frame;
}],
[/* 16 */ 'bsock', '/lib/util.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);
const URL = __browser_require__(6 /* 'url' */, module);

exports.parseURL = function parseURL(url) {
  if (url.indexOf('://') === -1)
    url = `ws://${url}`;

  const data = URL.parse(url);

  if (data.protocol !== 'http:'
      && data.protocol !== 'https:'
      && data.protocol !== 'ws:'
      && data.protocol !== 'wss:') {
    throw new Error('Invalid protocol for websocket URL.');
  }

  if (!data.hostname)
    throw new Error('Malformed URL.');

  const host = data.hostname;

  let port = 80;
  let ssl = false;

  if (data.protocol === 'https:' || data.protocol === 'wss:') {
    port = 443;
    ssl = true;
  }

  if (data.port) {
    port = parseInt(data.port, 10);
    assert((port & 0xffff) === port);
    assert(port !== 0);
  }

  return [port, host, ssl];
};
}],
[/* 17 */ 'bsock', '/lib/parser.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * parser.js - packet parser
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/chjj
 */

'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);
const EventEmitter = __browser_require__(5 /* 'events' */, module);
const Frame = __browser_require__(15 /* './frame' */, module);

const MAX_MESSAGE = 100000000;

class Parser extends EventEmitter {
  constructor() {
    super();
  }

  error(msg) {
    this.emit('error', new Error(msg));
  }

  feedBinary(data) {
    assert((data != null && data._isBuffer === true));

    if (data.length > MAX_MESSAGE) {
      this.error('Frame too large.');
      return;
    }

    let frame;
    try {
      frame = Frame.fromRaw(data);
    } catch (e) {
      this.emit('error', e);
      return;
    }

    this.emit('frame', frame);
  }

  feedString(data) {
    assert(typeof data === 'string');

    if (Buffer.byteLength(data, 'utf8') > MAX_MESSAGE) {
      this.error('Frame too large.');
      return;
    }

    let frame;
    try {
      frame = Frame.fromString(data);
    } catch (e) {
      this.emit('error', e);
      return;
    }

    this.emit('frame', frame);
  }
}

/*
 * Expose
 */

module.exports = Parser;
}],
[/* 18 */ 'bsock', '/lib/codes.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
module.exports = {
  1000: 'NORMAL_CLOSURE',
  1001: 'GOING_AWAY',
  1002: 'PROTOCOL_ERROR',
  1003: 'UNSUPPORTED_DATA',
  1004: 'RESERVED',
  1005: 'NO_STATUS_RECVD',
  1006: 'ABNORMAL_CLOSURE',
  1007: 'INVALID_FRAME_PAYLOAD_DATA',
  1008: 'POLICY_VIOLATION',
  1009: 'MESSAGE_TOO_BIG',
  1010: 'MISSING_EXTENSION',
  1011: 'INTERNAL_ERROR',
  1012: 'SERVICE_RESTART',
  1013: 'TRY_AGAIN_LATER',
  1014: 'BAD_GATEWAY',
  1015: 'TLS_HANDSHAKE'
};
}],
[/* 19 */ 'bsock', '/lib/blacklist.js', function(exports, require, module, __filename, __dirname, __meta) {
'use strict';

module.exports = {
  connect: true,
  connect_error: true,
  connect_timeout: true,
  connecting: true,
  disconnect: true,
  error: true,
  reconnect: true,
  reconnect_attempt: true,
  reconnect_failed: true,
  reconnect_error: true,
  reconnecting: true,
  ping: true,
  pong: true
};
}],
[/* 20 */ 'brq', '/lib/brq.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * brq.js - simple request module
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/brq
 */

'use strict';

module.exports = __browser_require__(21 /* './request' */, module);
}],
[/* 21 */ 'brq', '/lib/request-browser.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * request.js - http request for brq
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/brq
 */

'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);
const EventEmitter = __browser_require__(5 /* 'events' */, module);
const URL = __browser_require__(6 /* 'url' */, module);
const qs = __browser_require__(8 /* 'querystring' */, module);
const mime = __browser_require__(22 /* './mime' */, module);
const fetch = global.fetch;
const FetchHeaders = global.Headers;

class RequestOptions {
  /**
   * Request Options
   * @constructor
   * @ignore
   * @param {Object} options
   */

  constructor(options, buffer) {
    this.method = 'GET';
    this.ssl = false;
    this.host = 'localhost';
    this.port = 80;
    this.path = '/';
    this.query = '';
    this.agent = 'brq';
    this.lookup = null;

    this.type = null;
    this.expect = null;
    this.body = null;
    this.username = '';
    this.password = '';
    this.limit = 20 << 20;
    this.timeout = 5000;
    this.buffer = buffer || false;
    this.headers = Object.create(null);

    if (options)
      this.fromOptions(options);
  }

  fromOptions(options) {
    if (typeof options === 'string')
      options = { url: options };

    if (options.method != null) {
      assert(typeof options.method === 'string');
      this.method = options.method.toUpperCase();
    }

    if (options.uri != null)
      this.navigate(options.uri);

    if (options.url != null)
      this.navigate(options.url);

    if (options.ssl != null) {
      assert(typeof options.ssl === 'boolean');
      this.ssl = options.ssl;
      this.port = 443;
    }

    if (options.host != null) {
      assert(typeof options.host === 'string');
      this.host = options.host;
    }

    if (options.port != null) {
      assert((options.port & 0xffff) === options.port);
      assert(options.port !== 0);
      this.port = options.port;
    }

    if (options.path != null) {
      assert(typeof options.path === 'string');
      this.path = options.path;
    }

    if (options.query != null) {
      if (typeof options.query === 'string') {
        this.query = options.query;
      } else {
        assert(typeof options.query === 'object');
        this.query = qs.stringify(options.query);
      }
    }

    if (options.username != null) {
      assert(typeof options.username === 'string');
      this.username = options.username;
    }

    if (options.password != null) {
      assert(typeof options.password === 'string');
      this.password = options.password;
    }

    if (options.agent != null) {
      assert(typeof options.agent === 'string');
      this.agent = options.agent;
    }

    if (options.json != null) {
      assert(typeof options.json === 'object');
      this.body = Buffer.from(JSON.stringify(options.json), 'utf8');
      this.type = 'json';
    }

    if (options.form != null) {
      assert(typeof options.form === 'object');
      this.body = Buffer.from(qs.stringify(options.form), 'utf8');
      this.type = 'form';
    }

    if (options.type != null) {
      assert(typeof options.type === 'string');
      this.type = options.type;
    }

    if (options.expect != null) {
      assert(typeof options.expect === 'string');
      this.expect = options.expect;
    }

    if (options.body != null) {
      if (typeof options.body === 'string') {
        this.body = Buffer.from(options.body, 'utf8');
      } else {
        assert((options.body != null && options.body._isBuffer === true));
        this.body = options.body;
      }
    }

    if (options.extra != null) {
      assert((options.extra != null && options.extra._isBuffer === true));
      if (!this.body)
        this.body = options.extra;
      else
        this.body = Buffer.concat([this.body, options.extra]);
    }

    if (options.timeout != null) {
      assert(typeof options.timeout === 'number');
      this.timeout = options.timeout;
    }

    if (options.limit != null) {
      assert(typeof options.limit === 'number');
      this.limit = options.limit;
    }

    if (options.headers != null) {
      assert(typeof options.headers === 'object');
      this.headers = options.headers;
    }

    if (options.lookup != null) {
      assert(typeof options.lookup === 'function');
      this.lookup = options.lookup;
    }

    return this;
  }

  navigate(url) {
    assert(typeof url === 'string');

    if (url.indexOf('://') === -1)
      url = 'http://' + url;

    const data = URL.parse(url);

    if (data.protocol !== 'http:'
        && data.protocol !== 'https:') {
      throw new Error('Malformed URL.');
    }

    if (!data.hostname)
      throw new Error('Malformed URL.');

    this.ssl = data.protocol === 'https:';
    this.host = data.hostname;
    this.port = this.ssl ? 443 : 80;

    if (data.port != null) {
      const port = parseInt(data.port, 10);
      assert((port & 0xffff) === port);
      this.port = port;
    }

    this.path = data.pathname;
    this.query = data.query;

    if (data.auth) {
      const parts = data.auth.split(':');
      this.username = parts.shift();
      this.password = parts.join(':');
    }

    return this;
  }

  isExpected(type) {
    assert(typeof type === 'string');

    if (!this.expect)
      return true;

    return this.expect === type;
  }

  isOverflow(hdr) {
    if (hdr == null)
      return false;

    assert(typeof hdr === 'string');

    if (!this.buffer)
      return false;

    hdr = hdr.trim();

    if (!/^\d+$/.test(hdr))
      return false;

    hdr = hdr.replace(/^0+/g, '');

    if (hdr.length === 0)
      hdr = '0';

    if (hdr.length > 15)
      return false;

    const length = parseInt(hdr, 10);

    if (!Number.isSafeInteger(length))
      return true;

    return length > this.limit;
  }

  getHeaders() {
    const headers = new FetchHeaders();

    headers.append('User-Agent', this.agent);

    if (this.type)
      headers.append('Content-Type', mime.type(this.type));

    if (this.body)
      headers.append('Content-Length', this.body.length.toString(10));

    if (this.username || this.password) {
      const auth = `${this.username}:${this.password}`;
      const data = Buffer.from(auth, 'utf8');
      headers.append('Authorization', `Basic ${data.toString('base64')}`);
    }

    for (const name of Object.keys(this.headers))
      headers.append(name, this.headers[name]);

    return headers;
  }

  toURL() {
    let url = '';

    if (this.ssl)
      url += 'https://';
    else
      url += 'http://';

    if (this.host.indexOf(':') !== -1)
      url += `[${this.host}]`;
    else
      url += this.host;

    url += ':' + this.port;
    url += this.path;

    if (this.query)
      url += '?' + this.query;

    return url;
  }

  toHTTP() {
    return {
      method: this.method,
      headers: this.getHeaders(),
      body: this.body
        ? new Uint8Array(this.body.buffer,
                         this.body.byteOffset,
                         this.body.byteLength)
        : null,
      mode: 'cors',
      credentials: 'include',
      cache: 'no-cache',
      redirect: 'follow',
      referrer: 'no-referrer'
    };
  }
}

class Response {
  /**
   * Response
   * @constructor
   * @ignore
   */

  constructor() {
    this.statusCode = 0;
    this.headers = Object.create(null);
    this.type = 'bin';
    this.str = '';
    this.buf = null;
  }

  text() {
    if (!this.buf)
      return this.str;
    return this.buf.toString('utf8');
  }

  buffer() {
    if (!this.buf)
      return Buffer.from(this.str, 'utf8');
    return this.buf;
  }

  json() {
    const text = this.text().trim();

    if (text.length === 0)
      return Object.create(null);

    const body = JSON.parse(text);

    if (!body || typeof body !== 'object')
      throw new Error('JSON body is a non-object.');

    return body;
  }

  form() {
    return qs.parse(this.text());
  }

  static fromFetch(response) {
    const res = new Response();

    res.statusCode = response.status;

    for (const [key, value] of response.headers.entries())
      res.headers[key.toLowerCase()] = value;

    return res;
  }
}

/**
 * Make an HTTP request.
 * @private
 * @param {Object} options
 * @returns {Promise}
 */

async function _request(options, buffer) {
  if (typeof fetch !== 'function')
    throw new Error('Fetch API not available.');

  const opt = new RequestOptions(options, buffer);
  const response = await fetch(opt.toURL(), opt.toHTTP());
  const res = Response.fromFetch(response);
  const type = mime.ext(res.headers['content-type']);
  const length = res.headers['content-length'];

  if (!opt.isExpected(type))
    throw new Error('Wrong content-type for response.');

  if (opt.isOverflow(length))
    throw new Error('Response exceeded limit.');

  res.type = type;

  if (mime.textual(type)) {
    const data = await response.text();

    if (opt.limit && data.length > opt.limit)
      throw new Error('Response exceeded limit.');

    res.str = data;
  } else {
    const data = await response.arrayBuffer();

    if (opt.limit && data.byteLength > opt.limit)
      throw new Error('Response exceeded limit.');

    res.buf = Buffer.from(data, 0, data.byteLength);
  }

  return res;
}

/**
 * Make an HTTP request.
 * @param {Object} options
 * @returns {Promise}
 */

async function request(options) {
  if (typeof options === 'string')
    options = { url: options };

  return _request(options, true);
}

request.stream = function stream(options) {
  if (typeof options === 'string')
    options = { url: options };

  const s = new EventEmitter();
  const body = [];

  s.write = (data, enc) => {
    if (!(data != null && data._isBuffer === true)) {
      assert(typeof data === 'string');
      data = Buffer.from(data, enc);
    }
    body.push(data);
    return true;
  };

  s.end = () => {
    options.extra = Buffer.concat(body);
    _request(options, false).then((res) => {
      s.emit('headers', res.headers);
      s.emit('type', res.type);
      s.emit('response', res);
      s.emit('data', res.buffer());
      s.emit('end');
      s.emit('close');
    }).catch((err) => {
      s.emit('error', err);
    });
    return true;
  };

  return s;
};

/*
 * Expose
 */

module.exports = request;
}],
[/* 22 */ 'brq', '/lib/mime.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * mime.js - mime types for brq
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/brq
 */

'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);

const types = {
  'atom': ['application/atom+xml', true],
  'bin': ['application/octet-stream', false],
  'bmp': ['image/bmp', false],
  'cjs': ['application/javascript', true],
  'css': ['text/css', true],
  'dat': ['application/octet-stream', false],
  'form': ['application/x-www-form-urlencoded', true],
  'gif': ['image/gif', false],
  'gz': ['application/x-gzip', false],
  'htc': ['text/x-component', true],
  'html': ['text/html', true],
  'ico': ['image/x-icon', false],
  'jpg': ['image/jpeg', false],
  'jpeg': ['image/jpeg', false],
  'js': ['application/javascript', true],
  'json': ['application/json', true],
  'log': ['text/plain', true],
  'manifest': ['text/cache-manifest', false],
  'mathml': ['application/mathml+xml', true],
  'md': ['text/plain', true],
  'mjs': ['application/javascript', true],
  'mkv': ['video/x-matroska', false],
  'mml': ['application/mathml+xml', true],
  'mp3': ['audio/mpeg', false],
  'mp4': ['video/mp4', false],
  'mpeg': ['video/mpeg', false],
  'mpg': ['video/mpeg', false],
  'oga': ['audio/ogg', false],
  'ogg': ['application/ogg', false],
  'ogv': ['video/ogg', false],
  'otf': ['font/otf', false],
  'pdf': ['application/pdf', false],
  'png': ['image/png', false],
  'rdf': ['application/rdf+xml', true],
  'rss': ['application/rss+xml', true],
  'svg': ['image/svg+xml', false],
  'swf': ['application/x-shockwave-flash', false],
  'tar': ['application/x-tar', false],
  'torrent': ['application/x-bittorrent', false],
  'txt': ['text/plain', true],
  'ttf': ['font/ttf', false],
  'wav': ['audio/wav', false],
  'webm': ['video/webm', false],
  'woff': ['font/x-woff', false],
  'xhtml': ['application/xhtml+xml', true],
  'xbl': ['application/xml', true],
  'xml': ['application/xml', true],
  'xsl': ['application/xml', true],
  'xslt': ['application/xslt+xml', true],
  'zip': ['application/zip', false]
};

const extensions = {
  'application/atom+xml': 'atom',
  'application/octet-stream': 'bin',
  'image/bmp': 'bmp',
  'text/css': 'css',
  'application/x-www-form-urlencoded': 'form',
  'image/gif': 'gif',
  'application/x-gzip': 'gz',
  'text/x-component': 'htc',
  'text/html': 'html',
  'text/xml': 'xml',
  'image/x-icon': 'ico',
  'image/jpeg': 'jpeg',
  'text/javascript': 'js',
  'application/javascript': 'js',
  'text/x-json': 'json',
  'application/json': 'json',
  'text/json': 'json',
  'text/plain': 'txt',
  'text/cache-manifest': 'manifest',
  'application/mathml+xml': 'mml',
  'video/x-matroska': 'mkv',
  'audio/x-matroska': 'mkv',
  'audio/mpeg': 'mp3',
  'audio/mpa': 'mp3',
  'video/mp4': 'mp4',
  'video/mpeg': 'mpg',
  'audio/ogg': 'oga',
  'application/ogg': 'ogg',
  'video/ogg': 'ogv',
  'font/otf': 'otf',
  'application/pdf': 'pdf',
  'application/x-pdf': 'pdf',
  'image/png': 'png',
  'application/rdf+xml': 'rdf',
  'application/rss+xml': 'rss',
  'image/svg+xml': 'svg',
  'application/x-shockwave-flash': 'swf',
  'application/x-tar': 'tar',
  'application/x-bittorrent': 'torrent',
  'font/ttf': 'ttf',
  'audio/wav': 'wav',
  'audio/wave': 'wav',
  'video/webm': 'webm',
  'audio/webm': 'webm',
  'font/x-woff': 'woff',
  'application/xhtml+xml': 'xhtml',
  'application/xml': 'xsl',
  'application/xslt+xml': 'xslt',
  'application/zip': 'zip'
};

// Filename to extension
exports.file = function file(path) {
  assert(typeof path === 'string');

  const name = path.split('/').pop();
  const parts = name.split('.');

  if (parts.length < 2)
    return 'bin';

  if (parts.length === 2 && parts[0] === '')
    return 'txt';

  const ext = parts[parts.length - 1];

  if (types[ext])
    return ext;

  return 'bin';
};

// Is extension textual?
exports.textual = function textual(ext) {
  const value = types[ext];

  if (!value)
    return false;

  return value[1];
};

// Extension to content-type
exports.type = function type(ext) {
  assert(typeof ext === 'string');

  if (ext.indexOf('/') !== -1)
    return ext;

  const value = types[ext];

  if (!value)
    return 'application/octet-stream';

  let [name, text] = value;

  if (text)
    name += '; charset=utf-8';

  return name;
};

// Content-type to extension
exports.ext = function ext(type) {
  if (type == null)
    return 'bin';

  assert(typeof type === 'string');

  [type] = type.split(';');
  type = type.toLowerCase();
  type = type.trim();

  return extensions[type] || 'bin';
};
}],
[/* 23 */ 'bcoin', '/lib/client/wallet.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * wallet.js - http wallet client for bcoin
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const assert = __browser_require__(2 /* 'bsert' */, module);
const EventEmitter = __browser_require__(5 /* 'events' */, module);
const {Client} = __browser_require__(3 /* 'bcurl' */, module);

/**
 * Wallet Client
 * @alias module:client.WalletClient
 * @extends {bcurl.Client}
 */

class WalletClient extends Client {
  /**
   * Create a wallet client.
   * @param {Object?} options
   */

  constructor(options) {
    super(options);
    this.wallets = new Map();
  }

  /**
   * Open the client.
   * @private
   * @returns {Promise}
   */

  init() {
    this.bind('tx', (id, details) => {
      this.dispatch(id, 'tx', details);
    });

    this.bind('confirmed', (id, details) => {
      this.dispatch(id, 'confirmed', details);
    });

    this.bind('unconfirmed', (id, details) => {
      this.dispatch(id, 'unconfirmed', details);
    });

    this.bind('conflict', (id, details) => {
      this.dispatch(id, 'conflict', details);
    });

    this.bind('updated', (id, details) => {
      this.dispatch(id, 'updated', details);
    });

    this.bind('address', (id, receive) => {
      this.dispatch(id, 'address', receive);
    });

    this.bind('balance', (id, balance) => {
      this.dispatch(id, 'balance', balance);
    });
  }

  /**
   * Dispatch event.
   * @param {Number} id
   * @param {String} event
   * @param {...Object} args
   * @private
   */

  dispatch(id, event, ...args) {
    const wallet = this.wallets.get(id);

    if (wallet)
      wallet.emit(event, ...args);
  }

  /**
   * Open the client.
   * @returns {Promise}
   */

  async open() {
    await super.open();
    this.init();
  }

  /**
   * Close the client.
   * @returns {Promise}
   */

  async close() {
    await super.close();
    this.wallets = new Map();
  }

  /**
   * Auth with server.
   * @returns {Promise}
   */

  async auth() {
    await this.call('auth', this.password);
  }

  /**
   * Make an RPC call.
   * @returns {Promise}
   */

  execute(name, params) {
    return super.execute('/', name, params);
  }

  /**
   * Create a wallet object.
   * @param {Number} id
   * @param {String} token
   */

  wallet(id, token) {
    return new Wallet(this, id, token);
  }

  /**
   * Join a wallet.
   * @param {String} token
   */

  all(token) {
    return this.call('join', '*', token);
  }

  /**
   * Leave a wallet.
   */

  none() {
    return this.call('leave', '*');
  }

  /**
   * Join a wallet.
   * @param {Number} id
   * @param {String} token
   */

  join(id, token) {
    return this.call('join', id, token);
  }

  /**
   * Leave a wallet.
   * @param {Number} id
   */

  leave(id) {
    return this.call('leave', id);
  }

  /**
   * Rescan the chain.
   * @param {Number} height
   * @returns {Promise}
   */

  rescan(height) {
    return this.post('/rescan', { height });
  }

  /**
   * Resend pending transactions.
   * @returns {Promise}
   */

  resend() {
    return this.post('/resend');
  }

  /**
   * Backup the walletdb.
   * @param {String} path
   * @returns {Promise}
   */

  backup(path) {
    return this.post('/backup', { path });
  }

  /**
   * Get list of all wallet IDs.
   * @returns {Promise}
   */

  getWallets() {
    return this.get('/wallet');
  }

  /**
   * Create a wallet.
   * @param {Number} id
   * @param {Object} options
   * @returns {Promise}
   */

  createWallet(id, options) {
    return this.put(`/wallet/${id}`, options);
  }

  /**
   * Get wallet transaction history.
   * @param {Number} id
   * @param {String} account
   * @returns {Promise}
   */

  getHistory(id, account) {
    return this.get(`/wallet/${id}/tx/history`, { account });
  }

  /**
   * Get wallet coins.
   * @param {Number} id
   * @param {String} account
   * @returns {Promise}
   */

  getCoins(id, account) {
    return this.get(`/wallet/${id}/coin`, { account });
  }

  /**
   * Get all unconfirmed transactions.
   * @param {Number} id
   * @param {String} account
   * @returns {Promise}
   */

  getPending(id, account) {
    return this.get(`/wallet/${id}/tx/unconfirmed`, { account });
  }

  /**
   * Calculate wallet balance.
   * @param {Number} id
   * @param {String} account
   * @returns {Promise}
   */

  getBalance(id, account) {
    return this.get(`/wallet/${id}/balance`, { account });
  }

  /**
   * Get last N wallet transactions.
   * @param {Number} id
   * @param {String} account
   * @param {Number} limit - Max number of transactions.
   * @returns {Promise}
   */

  getLast(id, account, limit) {
    return this.get(`/wallet/${id}/tx/last`, { account, limit });
  }

  /**
   * Get wallet transactions by timestamp range.
   * @param {Number} id
   * @param {String} account
   * @param {Object} options
   * @param {Number} options.start - Start time.
   * @param {Number} options.end - End time.
   * @param {Number?} options.limit - Max number of records.
   * @param {Boolean?} options.reverse - Reverse order.
   * @returns {Promise}
   */

  getRange(id, account, options) {
    return this.get(`/wallet/${id}/tx/range`, {
      account: account,
      start: options.start,
      end: options.end,
      limit: options.limit,
      reverse: options.reverse
    });
  }

  /**
   * Get transaction (only possible if the transaction
   * is available in the wallet history).
   * @param {Number} id
   * @param {Hash} hash
   * @returns {Promise}
   */

  getTX(id, hash) {
    return this.get(`/wallet/${id}/tx/${hash}`);
  }

  /**
   * Get wallet blocks.
   * @param {Number} id
   * @returns {Promise}
   */

  getBlocks(id) {
    return this.get(`/wallet/${id}/block`);
  }

  /**
   * Get wallet block.
   * @param {Number} id
   * @param {Number} height
   * @returns {Promise}
   */

  getBlock(id, height) {
    return this.get(`/wallet/${id}/block/${height}`);
  }

  /**
   * Get unspent coin (only possible if the transaction
   * is available in the wallet history).
   * @param {Number} id
   * @param {Hash} hash
   * @param {Number} index
   * @returns {Promise}
   */

  getCoin(id, hash, index) {
    return this.get(`/wallet/${id}/coin/${hash}/${index}`);
  }

  /**
   * @param {Number} id
   * @param {String} account
   * @param {Number} age - Age delta.
   * @returns {Promise}
   */

  zap(id, account, age) {
    return this.post(`/wallet/${id}/zap`, { account, age });
  }

  /**
   * @param {Number} id
   * @param {Hash} hash
   * @returns {Promise}
   */

  abandon(id, hash) {
    return this.del(`/wallet/${id}/tx/${hash}`);
  }

  /**
   * Create a transaction, fill.
   * @param {Number} id
   * @param {Object} options
   * @returns {Promise}
   */

  createTX(id, options) {
    return this.post(`/wallet/${id}/create`, options);
  }

  /**
   * Create a transaction, fill, sign, and broadcast.
   * @param {Number} id
   * @param {Object} options
   * @param {String} options.address
   * @param {Amount} options.value
   * @returns {Promise}
   */

  send(id, options) {
    return this.post(`/wallet/${id}/send`, options);
  }

  /**
   * Sign a transaction.
   * @param {Number} id
   * @param {Object} options
   * @returns {Promise}
   */

  sign(id, options) {
    return this.post(`/wallet/${id}/sign`, options);
  }

  /**
   * Get the raw wallet JSON.
   * @param {Number} id
   * @returns {Promise}
   */

  getInfo(id) {
    return this.get(`/wallet/${id}`);
  }

  /**
   * Get wallet accounts.
   * @param {Number} id
   * @returns {Promise} - Returns Array.
   */

  getAccounts(id) {
    return this.get(`/wallet/${id}/account`);
  }

  /**
   * Get wallet master key.
   * @param {Number} id
   * @returns {Promise}
   */

  getMaster(id) {
    return this.get(`/wallet/${id}/master`);
  }

  /**
   * Get wallet account.
   * @param {Number} id
   * @param {String} account
   * @returns {Promise}
   */

  getAccount(id, account) {
    return this.get(`/wallet/${id}/account/${account}`);
  }

  /**
   * Create account.
   * @param {Number} id
   * @param {String} name
   * @param {Object} options
   * @returns {Promise}
   */

  createAccount(id, name, options) {
    return this.put(`/wallet/${id}/account/${name}`, options);
  }

  /**
   * Create address.
   * @param {Number} id
   * @param {String} account
   * @returns {Promise}
   */

  createAddress(id, account) {
    return this.post(`/wallet/${id}/address`, { account });
  }

  /**
   * Create change address.
   * @param {Number} id
   * @param {String} account
   * @returns {Promise}
   */

  createChange(id, account) {
    return this.post(`/wallet/${id}/change`, { account });
  }

  /**
   * Create nested address.
   * @param {Number} id
   * @param {String} account
   * @returns {Promise}
   */

  createNested(id, account) {
    return this.post(`/wallet/${id}/nested`, { account });
  }

  /**
   * Change or set master key`s passphrase.
   * @param {Number} id
   * @param {String|Buffer} passphrase
   * @param {(String|Buffer)?} old
   * @returns {Promise}
   */

  setPassphrase(id, passphrase, old) {
    return this.post(`/wallet/${id}/passphrase`, { passphrase, old });
  }

  /**
   * Generate a new token.
   * @param {Number} id
   * @param {(String|Buffer)?} passphrase
   * @returns {Promise}
   */

  retoken(id, passphrase) {
    return this.post(`/wallet/${id}/retoken`, {
      passphrase
    });
  }

  /**
   * Import private key.
   * @param {Number} id
   * @param {String} account
   * @param {String} privateKey
   * @param {String} passphrase
   * @returns {Promise}
   */

  importPrivate(id, account, privateKey, passphrase) {
    return this.post(`/wallet/${id}/import`, {
      account,
      privateKey,
      passphrase
    });
  }

  /**
   * Import public key.
   * @param {Number} id
   * @param {Number|String} account
   * @param {String} publicKey
   * @returns {Promise}
   */

  importPublic(id, account, publicKey) {
    return this.post(`/wallet/${id}/import`, {
      account,
      publicKey
    });
  }

  /**
   * Import address.
   * @param {Number} id
   * @param {String} account
   * @param {String} address
   * @returns {Promise}
   */

  importAddress(id, account, address) {
    return this.post(`/wallet/${id}/import`, { account, address });
  }

  /**
   * Lock a coin.
   * @param {Number} id
   * @param {String} hash
   * @param {Number} index
   * @returns {Promise}
   */

  lockCoin(id, hash, index) {
    return this.put(`/wallet/${id}/locked/${hash}/${index}`);
  }

  /**
   * Unlock a coin.
   * @param {Number} id
   * @param {String} hash
   * @param {Number} index
   * @returns {Promise}
   */

  unlockCoin(id, hash, index) {
    return this.del(`/wallet/${id}/locked/${hash}/${index}`);
  }

  /**
   * Get locked coins.
   * @param {Number} id
   * @returns {Promise}
   */

  getLocked(id) {
    return this.get(`/wallet/${id}/locked`);
  }

  /**
   * Lock wallet.
   * @param {Number} id
   * @returns {Promise}
   */

  lock(id) {
    return this.post(`/wallet/${id}/lock`);
  }

  /**
   * Unlock wallet.
   * @param {Number} id
   * @param {String} passphrase
   * @param {Number} timeout
   * @returns {Promise}
   */

  unlock(id, passphrase, timeout) {
    return this.post(`/wallet/${id}/unlock`, { passphrase, timeout });
  }

  /**
   * Get wallet key.
   * @param {Number} id
   * @param {String} address
   * @returns {Promise}
   */

  getKey(id, address) {
    return this.get(`/wallet/${id}/key/${address}`);
  }

  /**
   * Get wallet key WIF dump.
   * @param {Number} id
   * @param {String} address
   * @param {String?} passphrase
   * @returns {Promise}
   */

  getWIF(id, address, passphrase) {
    return this.get(`/wallet/${id}/wif/${address}`, { passphrase });
  }

  /**
   * Add a public account key to the wallet for multisig.
   * @param {Number} id
   * @param {String} account
   * @param {String} accountKey - Account (bip44) key (base58).
   * @returns {Promise}
   */

  addSharedKey(id, account, accountKey) {
    return this.put(`/wallet/${id}/shared-key`, { account, accountKey });
  }

  /**
   * Remove a public account key to the wallet for multisig.
   * @param {Number} id
   * @param {String} account
   * @param {String} accountKey - Account (bip44) key (base58).
   * @returns {Promise}
   */

  removeSharedKey(id, account, accountKey) {
    return this.del(`/wallet/${id}/shared-key`, { account, accountKey });
  }

  /**
   * Resend wallet transactions.
   * @param {Number} id
   * @returns {Promise}
   */

  resendWallet(id) {
    return this.post(`/wallet/${id}/resend`);
  }
}

/**
 * Wallet Instance
 * @extends {EventEmitter}
 */

class Wallet extends EventEmitter {
  /**
   * Create a wallet client.
   * @param {Wallet} parent
   * @param {Number} id
   * @param {String} token
   */

  constructor(parent, id, token) {
    super();
    this.parent = parent;
    this.client = parent.clone();
    this.client.token = token;
    this.id = id;
    this.token = token;
  }

  /**
   * Open wallet.
   * @returns {Promise}
   */

  async open() {
    await this.parent.join(this.id, this.token);
    this.parent.wallets.set(this.id, this);
  }

  /**
   * Close wallet.
   * @returns {Promise}
   */

  async close() {
    await this.parent.leave(this.id);
    this.parent.wallets.delete(this.id);
  }

  /**
   * Get wallet transaction history.
   * @param {String} account
   * @returns {Promise}
   */

  getHistory(account) {
    return this.client.getHistory(this.id, account);
  }

  /**
   * Get wallet coins.
   * @param {String} account
   * @returns {Promise}
   */

  getCoins(account) {
    return this.client.getCoins(this.id, account);
  }

  /**
   * Get all unconfirmed transactions.
   * @param {String} account
   * @returns {Promise}
   */

  getPending(account) {
    return this.client.getPending(this.id, account);
  }

  /**
   * Calculate wallet balance.
   * @param {String} account
   * @returns {Promise}
   */

  getBalance(account) {
    return this.client.getBalance(this.id, account);
  }

  /**
   * Get last N wallet transactions.
   * @param {String} account
   * @param {Number} limit - Max number of transactions.
   * @returns {Promise}
   */

  getLast(account, limit) {
    return this.client.getLast(this.id, account, limit);
  }

  /**
   * Get wallet transactions by timestamp range.
   * @param {String} account
   * @param {Object} options
   * @param {Number} options.start - Start time.
   * @param {Number} options.end - End time.
   * @param {Number?} options.limit - Max number of records.
   * @param {Boolean?} options.reverse - Reverse order.
   * @returns {Promise}
   */

  getRange(account, options) {
    return this.client.getRange(this.id, account, options);
  }

  /**
   * Get transaction (only possible if the transaction
   * is available in the wallet history).
   * @param {Hash} hash
   * @returns {Promise}
   */

  getTX(hash) {
    return this.client.getTX(this.id, hash);
  }

  /**
   * Get wallet blocks.
   * @returns {Promise}
   */

  getBlocks() {
    return this.client.getBlocks(this.id);
  }

  /**
   * Get wallet block.
   * @param {Number} height
   * @returns {Promise}
   */

  getBlock(height) {
    return this.client.getBlock(this.id, height);
  }

  /**
   * Get unspent coin (only possible if the transaction
   * is available in the wallet history).
   * @param {Hash} hash
   * @param {Number} index
   * @returns {Promise}
   */

  getCoin(hash, index) {
    return this.client.getCoin(this.id, hash, index);
  }

  /**
   * @param {String} account
   * @param {Number} age - Age delta.
   * @returns {Promise}
   */

  zap(account, age) {
    return this.client.zap(this.id, account, age);
  }

  /**
   * Used to remove a pending transaction from the wallet.
   * That is likely the case if it has a policy or low fee
   * that prevents it from proper network propagation.
   * @param {Hash} hash
   * @returns {Promise}
   */

  abandon(hash) {
    return this.client.abandon(this.id, hash);
  }

  /**
   * Create a transaction, fill.
   * @param {Object} options
   * @returns {Promise}
   */

  createTX(options) {
    return this.client.createTX(this.id, options);
  }

  /**
   * Create a transaction, fill, sign, and broadcast.
   * @param {Object} options
   * @param {String} options.address
   * @param {Amount} options.value
   * @returns {Promise}
   */

  send(options) {
    return this.client.send(this.id, options);
  }

  /**
   * Sign a transaction.
   * @param {Object} options
   * @returns {Promise}
   */

  sign(options) {
    return this.client.sign(this.id, options);
  }

  /**
   * Get the raw wallet JSON.
   * @returns {Promise}
   */

  getInfo() {
    return this.client.getInfo(this.id);
  }

  /**
   * Get wallet accounts.
   * @returns {Promise} - Returns Array.
   */

  getAccounts() {
    return this.client.getAccounts(this.id);
  }

  /**
   * Get wallet master key.
   * @returns {Promise}
   */

  getMaster() {
    return this.client.getMaster(this.id);
  }

  /**
   * Get wallet account.
   * @param {String} account
   * @returns {Promise}
   */

  getAccount(account) {
    return this.client.getAccount(this.id, account);
  }

  /**
   * Create account.
   * @param {String} name
   * @param {Object} options
   * @returns {Promise}
   */

  createAccount(name, options) {
    return this.client.createAccount(this.id, name, options);
  }

  /**
   * Create address.
   * @param {String} account
   * @returns {Promise}
   */

  createAddress(account) {
    return this.client.createAddress(this.id, account);
  }

  /**
   * Create change address.
   * @param {String} account
   * @returns {Promise}
   */

  createChange(account) {
    return this.client.createChange(this.id, account);
  }

  /**
   * Create nested address.
   * @param {String} account
   * @returns {Promise}
   */

  createNested(account) {
    return this.client.createNested(this.id, account);
  }

  /**
   * Change or set master key`s passphrase.
   * @param {String|Buffer} passphrase
   * @param {(String|Buffer)?} old
   * @returns {Promise}
   */

  setPassphrase(passphrase, old) {
    return this.client.setPassphrase(this.id, passphrase, old);
  }

  /**
   * Generate a new token.
   * @param {(String|Buffer)?} passphrase
   * @returns {Promise}
   */

  async retoken(passphrase) {
    const result = await this.client.retoken(this.id, passphrase);

    assert(result);
    assert(typeof result.token === 'string');

    this.token = result.token;

    return result;
  }

  /**
   * Import private key.
   * @param {Number|String} account
   * @param {String} privateKey
   * @param {String} passphrase
   * @returns {Promise}
   */

  importPrivate(account, privateKey, passphrase) {
    return this.client.importPrivate(this.id, account, privateKey, passphrase);
  }

  /**
   * Import public key.
   * @param {Number|String} account
   * @param {String} publicKey
   * @returns {Promise}
   */

  importPublic(account, publicKey) {
    return this.client.importPublic(this.id, account, publicKey);
  }

  /**
   * Import address.
   * @param {Number|String} account
   * @param {String} address
   * @returns {Promise}
   */

  importAddress(account, address) {
    return this.client.importAddress(this.id, account, address);
  }

  /**
   * Lock a coin.
   * @param {String} hash
   * @param {Number} index
   * @returns {Promise}
   */

  lockCoin(hash, index) {
    return this.client.lockCoin(this.id, hash, index);
  }

  /**
   * Unlock a coin.
   * @param {String} hash
   * @param {Number} index
   * @returns {Promise}
   */

  unlockCoin(hash, index) {
    return this.client.unlockCoin(this.id, hash, index);
  }

  /**
   * Get locked coins.
   * @returns {Promise}
   */

  getLocked() {
    return this.client.getLocked(this.id);
  }

  /**
   * Lock wallet.
   * @returns {Promise}
   */

  lock() {
    return this.client.lock(this.id);
  }

  /**
   * Unlock wallet.
   * @param {String} passphrase
   * @param {Number} timeout
   * @returns {Promise}
   */

  unlock(passphrase, timeout) {
    return this.client.unlock(this.id, passphrase, timeout);
  }

  /**
   * Get wallet key.
   * @param {String} address
   * @returns {Promise}
   */

  getKey(address) {
    return this.client.getKey(this.id, address);
  }

  /**
   * Get wallet key WIF dump.
   * @param {String} address
   * @param {String?} passphrase
   * @returns {Promise}
   */

  getWIF(address, passphrase) {
    return this.client.getWIF(this.id, address, passphrase);
  }

  /**
   * Add a public account key to the wallet for multisig.
   * @param {String} account
   * @param {String} accountKey - Account (bip44) key (base58).
   * @returns {Promise}
   */

  addSharedKey(account, accountKey) {
    return this.client.addSharedKey(this.id, account, accountKey);
  }

  /**
   * Remove a public account key to the wallet for multisig.
   * @param {String} account
   * @param {String} accountKey - Account (bip44) key (base58).
   * @returns {Promise}
   */

  removeSharedKey(account, accountKey) {
    return this.client.removeSharedKey(this.id, account, accountKey);
  }

  /**
   * Resend wallet transactions.
   * @returns {Promise}
   */

  resend() {
    return this.client.resendWallet(this.id);
  }
}

/*
 * Expose
 */

module.exports = WalletClient;
}],
[/* 24 */ 'bpkg', '/lib/builtins/timers.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * timers-browserify@2.0.10 - timers module for browserify
 * Copyright (c) 2019, J. Ryan Stinnett
 * https://github.com/jryans/timers-browserify
 *
 * License for timers-browserify@2.0.10:
 *
 * # timers-browserify
 *
 * This project uses the [MIT](http://jryans.mit-license.org/) license:
 *
 * Copyright © 2012 J. Ryan Stinnett <jryans@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * # lib/node
 *
 * The `lib/node` directory borrows files from joyent/node which uses the
 * following license:
 *
 * Copyright Joyent, Inc. and other Node contributors. All rights reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * License for setimmediate@1.0.5:
 *
 * Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic
 * Denicola
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* global MessageChannel */
/* eslint no-var: "off" */

'use strict';

var timers = exports;
var self = global;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;

/*
 * Globals
 */

var setTimeout = self.setTimeout;
var clearTimeout = self.clearTimeout;
var setInterval = self.setInterval;
var clearInterval = self.clearInterval;
var setImmediate = self.setImmediate;
var clearImmediate = self.clearImmediate;

/*
 * Helpers
 */

function _false() {
  return false;
}

function _this() {
  return this;
}

/*
 * Timeout
 */

function Timeout(set, clear, args) {
  this._id = apply.call(set, self, args);
  this._set = set;
  this._clear = clear;
  this._args = args;
}

Timeout.prototype.hasRef = _false;
Timeout.prototype.ref = _this;
Timeout.prototype.unref = _this;

Timeout.prototype.refresh = function() {
  this._clear.call(self, this._id);
  this._id = apply.call(this._set, self, this._args);
  return this;
};

Timeout.prototype.close = function() {
  this._clear.call(self, this._id);
  return this;
};

/*
 * Immediate
 */

function Immediate(id) {
  this._id = id;
}

Immediate.prototype.hasRef = _false;
Immediate.prototype.ref = _this;
Immediate.prototype.unref = _this;

/*
 * API
 */

timers.setTimeout = function() {
  var args = slice.call(arguments, 0);
  return new Timeout(setTimeout, clearTimeout, args);
};

timers.clearTimeout = function(timeout) {
  if (timeout instanceof Timeout)
    timeout.close();
};

timers.setInterval = function() {
  var args = slice.call(arguments, 0);
  return new Timeout(setInterval, clearInterval, args);
};

timers.clearInterval = timers.clearTimeout;

timers.setImmediate = function() {
  return new Immediate(apply.call(setImmediate, self, arguments));
};

timers.clearImmediate = function(immediate) {
  if (immediate instanceof Immediate)
    clearImmediate.call(self, immediate._id);
};

/*
 * setImmediate
 */

;(function() {
  if (self.setImmediate)
    return;

  var nextHandle = 1; // Spec says greater than zero
  var tasksByHandle = {};
  var currentlyRunningATask = false;
  var doc = self.document;
  var registerImmediate;

  function _setImmediate(callback) {
    // Callback can either be a function or a string
    if (typeof callback !== 'function')
      callback = new Function(String(callback));

    // Copy function arguments
    var args = new Array(arguments.length - 1);
    for (var i = 0; i < args.length; i++)
      args[i] = arguments[i + 1];

    // Store and register the task
    var task = { callback: callback, args: args };
    tasksByHandle[nextHandle] = task;
    registerImmediate(nextHandle);
    return nextHandle++;
  }

  function _clearImmediate(handle) {
    delete tasksByHandle[handle];
  }

  function run(task) {
    var callback = task.callback;
    var args = task.args;
    switch (args.length) {
      case 0:
        callback();
        break;
      case 1:
        callback(args[0]);
        break;
      case 2:
        callback(args[0], args[1]);
        break;
      case 3:
        callback(args[0], args[1], args[2]);
        break;
      default:
        callback.apply(undefined, args);
        break;
    }
  }

  function runIfPresent(handle) {
    if (currentlyRunningATask) {
      setTimeout(runIfPresent, 0, handle);
    } else {
      var task = tasksByHandle[handle];
      if (task) {
        currentlyRunningATask = true;
        try {
          run(task);
        } finally {
          _clearImmediate(handle);
          currentlyRunningATask = false;
        }
      }
    }
  }

  function canUsePostMessage() {
    if (self.postMessage && !self.importScripts) {
      var postMessageIsAsynchronous = true;
      var oldOnMessage = self.onmessage;
      self.onmessage = function() {
        postMessageIsAsynchronous = false;
      };
      self.postMessage('', '*');
      self.onmessage = oldOnMessage;
      return postMessageIsAsynchronous;
    }
    return false;
  }

  function installPostMessageImplementation() {
    var messagePrefix = 'setImmediate$' + Math.random() + '$';

    var onGlobalMessage = function(event) {
      if (event.source === self
          && typeof event.data === 'string'
          && event.data.indexOf(messagePrefix) === 0) {
        runIfPresent(event.data.slice(messagePrefix.length));
      }
    };

    if (self.addEventListener)
      self.addEventListener('message', onGlobalMessage, false);
    else
      self.attachEvent('onmessage', onGlobalMessage);

    registerImmediate = function(handle) {
      self.postMessage(messagePrefix + handle, '*');
    };
  }

  function installMessageChannelImplementation() {
    var channel = new MessageChannel();

    channel.port1.onmessage = function(event) {
      var handle = event.data;
      runIfPresent(handle);
    };

    registerImmediate = function(handle) {
      channel.port2.postMessage(handle);
    };
  }

  function installReadyStateChangeImplementation() {
    var html = doc.documentElement;

    registerImmediate = function(handle) {
      var script = doc.createElement('script');

      script.onreadystatechange = function () {
        runIfPresent(handle);
        script.onreadystatechange = null;
        html.removeChild(script);
        script = null;
      };

      html.appendChild(script);
    };
  }

  function installSetTimeoutImplementation() {
    registerImmediate = function(handle) {
      setTimeout(runIfPresent, 0, handle);
    };
  }

  if (canUsePostMessage()) {
    // For non-IE10 modern browsers
    installPostMessageImplementation();
  } else if (self.MessageChannel) {
    // For web workers, where supported
    installMessageChannelImplementation();
  } else if (doc && 'onreadystatechange' in doc.createElement('script')) {
    // For IE 6–8
    installReadyStateChangeImplementation();
  } else {
    // For older browsers
    installSetTimeoutImplementation();
  }

  setImmediate = _setImmediate;
  clearImmediate = _clearImmediate;
})();
}],
[/* 25 */ 'bpkg', '/lib/builtins/process.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * process.js - node process for javascript
 * Copyright (c) 2018-2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/bpkg
 *
 * Parts of this software are based on defunctzombie/node-process:
 *   Copyright (c) 2013, Roman Shtylman <shtylman@gmail.com>
 *   https://github.com/defunctzombie/node-process
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Roman Shtylman <shtylman@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* global BigInt */
/* eslint no-var: "off" */

'use strict';

var process = exports;
var self = global;
var setTimeout = self.setTimeout;
var clearTimeout = self.clearTimeout;
var boot = Number(new Date());
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

/*
 * Helpers
 */

function _array() {
  return [];
}

function _boolean() {
  return false;
}

function _noop() {}

function _number() {
  return 0;
}

function _string() {
  return '';
}

function _this() {
  return this;
}

/*
 * Timers
 */

function cleanUpNextTick() {
  if (!draining || !currentQueue)
    return;

  draining = false;

  if (currentQueue.length > 0)
    queue = currentQueue.concat(queue);
  else
    queueIndex = -1;

  if (queue.length > 0)
    drainQueue();
}

function drainQueue() {
  if (draining)
    return;

  var timeout = setTimeout.call(self, cleanUpNextTick, 0);
  var len = queue.length;

  draining = true;

  while (len > 0) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue)
        currentQueue[queueIndex].run();
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;

  clearTimeout.call(self, timeout);
}

/*
 * Item
 */

function Item(func, array) {
  this.func = func;
  this.array = array;
}

Item.prototype.run = function() {
  this.func.apply(null, this.array);
};

/*
 * Process
 */

process.allowedNodeEnvironmentFlags =
  typeof Set === 'function' ? new Set() : undefined;
process.arch = 'javascript';
process.argv = ['/usr/bin/node'];
process.argv0 = 'node';
process.browser = true;
process.channel = undefined;
process.config = {};
process.connected = undefined;
process.debugPort = 9229;
process.env = { __proto__: null };
process.env.PATH = '/usr/bin';
process.env.HOME = '/';
process.execArgv = [];
process.execPath = '/usr/bin/node';
process.exitCode = undefined;
process.mainModule = null;
process.noDeprecation = false;
process.pid = 1;
process.platform = 'browser';
process.ppid = 1;
process.release = { name: 'browser' };
process.report = {};
process.stdin = null;
process.stdout = null;
process.stderr = null;
process.throwDeprecation = false;
process.title = 'browser';
process.traceDeprecation = false;
process.version = 'v0.0.0';
process.versions = { node: '0.0.0' };

/*
 * Events
 */

process._events = { __proto__: null };
process._eventsCount = 0;
process._maxListeners = 0;

process.addListener = _this;
process.emit = _boolean;
process.eventNames = _array;
process.getMaxListeners = _number;
process.listenerCount = _number;
process.listeners = _array;
process.off = _this;
process.on = _this;
process.once = _this;
process.prependListener = _this;
process.prependOnceListener = _this;
process.removeAllListeners = _this;
process.removeListener = _this;
process.setMaxListeners = _this;
process.rawListeners = _array;

/*
 * Methods
 */

process.abort = function() {
  throw new Error('Process aborted.');
};

process.binding = function(name) {
  throw new Error('process.binding is not supported.');
};

process.chdir = function(directory) {
  throw new Error('process.chdir is not supported.');
};

process.cpuUsage = function(previousValue) {
  return { user: 0, system: 0 };
};

process.cwd = function() {
  return '/';
};

process.dlopen = function(module, filename, flags) {
  throw new Error('process.dlopen is not supported.');
};

process.emitWarning = function(warning, options) {
  var text = 'Warning: ' + warning;

  if (console.warn)
    console.warn(text);
  else if (console.error)
    console.error(text);
  else
    console.log(text);
};

process.exit = function(code) {
  if (code == null)
    code = process.exitCode;

  code >>>= 0;

  throw new Error('Exit code: ' + code + '.');
};

process.getegid = _number;
process.geteuid = _number;
process.getgid = _number;
process.getgroups = _array;
process.getuid = _number;
process.hasUncaughtExceptionCaptureCallback = _boolean;

process.hrtime = function(time) {
  var now = Number(new Date()) - boot;
  var mod, sec, ms, ns;

  if (now < 0) {
    boot = Number(new Date());
    now = 0;
  }

  if (time) {
    sec = time[0];
    ns = time[1];
    ms = sec * 1000 + Math.floor(ns / 1000000);

    now -= ms;

    if (!isFinite(now))
      now = 0;

    if (now < 0)
      now = 0;
  }

  mod = now % 1000;
  sec = (now - mod) / 1000;
  ns = mod * 1000000;

  return [sec, ns];
};

process.hrtime.bigint = function() {
  if (typeof BigInt !== 'function')
    throw new Error('BigInt is unsupported.');

  var now = Number(new Date()) - boot;

  if (now < 0) {
    boot = Number(new Date());
    now = 0;
  }

  return BigInt(now) * BigInt(1000000);
};

process.initgroups = _noop;
process.kill = _noop;

process.memoryUsage = function() {
  return {
    rss: 0,
    heapTotal: 0,
    heapUsed: 0,
    external: 0
  };
};

process.nextTick = function(callback) {
  if (typeof callback !== 'function')
    throw new TypeError('Callback must be a function');

  var args = new Array(arguments.length - 1);
  var i;

  if (arguments.length > 1) {
    for (i = 1; i < arguments.length; i++)
      args[i - 1] = arguments[i];
  }

  queue.push(new Item(callback, args));

  if (queue.length === 1 && !draining)
    setTimeout.call(self, drainQueue, 0);
};

process.report.getReport = _string;
process.report.setOptions = _noop;
process.report.triggerReport = _string;

process.send = undefined;
process.setegid = _noop;
process.seteuid = _noop;
process.setgid = _noop;
process.setgroups = _noop;
process.setuid = _noop;
process.setUncaughtExceptionCaptureCallback = _noop;
process.umask = _number;

process.uptime = function() {
  var now = Number(new Date()) - boot;

  if (now < 0) {
    boot = Number(new Date());
    now = 0;
  }

  return now / 1000;
};
}],
[/* 26 */ 'bpkg', '/lib/builtins/buffer.js', function(exports, require, module, __filename, __dirname, __meta) {
/*!
 * buffer@5.2.1 - Node.js Buffer API, for the browser
 * Copyright (c) 2019, Feross Aboukhadijeh (MIT)
 * https://github.com/feross/buffer
 *
 * License for buffer@5.2.1:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) Feross Aboukhadijeh, and other contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * License for base64-js@1.3.0:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * License for ieee754@1.1.12:
 *
 * Copyright (c) 2008, Fair Oaks Labs, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * * Neither the name of Fair Oaks Labs, Inc. nor the names of its contributors
 * may be used to endorse or promote products derived from this software
 * without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var __node_modules__ = [
[/* 0 */ 'buffer', '/index.js', function(exports, module, __filename, __dirname, __meta) {
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = __node_require__(1 /* 'base64-js' */)
var ieee754 = __node_require__(2 /* 'ieee754' */)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if ((obj != null && obj._isBuffer === true)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!(a != null && a._isBuffer === true) || !(b != null && b._isBuffer === true)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!(buf != null && buf._isBuffer === true)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if ((string != null && string._isBuffer === true)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!(b != null && b._isBuffer === true)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!(target != null && target._isBuffer === true)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if ((val != null && val._isBuffer === true)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)

  var first = this[offset]
  var last = this[offset + 7]

  var lo = first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24

  var hi = this[++offset] +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    last * 2 ** 24

  return BigInt(lo) + (BigInt(hi) << BigInt(32))
})

Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)

  var first = this[offset]
  var last = this[offset + 7]

  var hi = first * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    this[++offset]

  var lo = this[++offset] * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    last

  return (BigInt(hi) << BigInt(32)) + BigInt(lo)
})

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)

  var first = this[offset]
  var last = this[offset + 7]

  var val = this[offset + 4] +
    this[offset + 5] * 2 ** 8 +
    this[offset + 6] * 2 ** 16 +
    (last << 24) // Overflow

  return (BigInt(val) << BigInt(32)) +
    BigInt(first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24)
})

Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)

  var first = this[offset]
  var last = this[offset + 7]

  var val = (first << 24) + // Overflow
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    this[++offset]

  return (BigInt(val) << BigInt(32)) +
    BigInt(this[++offset] * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    last)
})

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!(buf != null && buf._isBuffer === true)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIntBI (buf, value, offset, ext, max, min) {
  if (!(buf != null && buf._isBuffer === true)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

function wrtBigUInt64LE (buf, value, offset, noAssert, min, max) {
  offset = offset >>> 0;
  if (!noAssert) checkIntBI(buf, value, offset, 8, max, min)
  var lo = Number(value & BigInt(0xffffffff))
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  var hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  return offset
}

function wrtBigUInt64BE (buf, value, offset, noAssert, min, max) {
  offset = offset >>> 0;
  if (!noAssert) checkIntBI(buf, value, offset, 8, max, min)
  var lo = Number(value & BigInt(0xffffffff))
  buf[offset + 7] = lo
  lo = lo >> 8
  buf[offset + 6] = lo
  lo = lo >> 8
  buf[offset + 5] = lo
  lo = lo >> 8
  buf[offset + 4] = lo
  var hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset + 3] = hi
  hi = hi >> 8
  buf[offset + 2] = hi
  hi = hi >> 8
  buf[offset + 1] = hi
  hi = hi >> 8
  buf[offset] = hi
  return offset + 8
}

Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE (value, offset, noAssert) {
  return wrtBigUInt64LE(this, value, offset, noAssert, BigInt(0), BigInt('0xffffffffffffffff'))
})

Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE (value, offset, noAssert) {
  return wrtBigUInt64BE(this, value, offset, noAssert, BigInt(0), BigInt('0xffffffffffffffff'))
})

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE (value, offset, noAssert) {
  return wrtBigUInt64LE(this, value, offset, noAssert, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
})

Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE (value, offset, noAssert) {
  return wrtBigUInt64BE(this, value, offset, noAssert, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
})

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!(target != null && target._isBuffer === true)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = (val != null && val._isBuffer === true)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Return not function with Error if BigInt not supported
function defineBigIntMethod (fn) {
  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn
}

function BufferBigIntNotDefined () {
  throw new Error('BigInt not supported')
}
}],
[/* 1 */ 'base64-js', '/index.js', function(exports, module, __filename, __dirname, __meta) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}
}],
[/* 2 */ 'ieee754', '/index.js', function(exports, module, __filename, __dirname, __meta) {
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}
}]
];

var __node_cache__ = [];

function __node_error__(location) {
  var err = new Error('Cannot find module \'' + location + '\'');
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}

function __node_require__(id) {
  if ((id >>> 0) !== id || id > __node_modules__.length)
    return __node_error__(id);

  while (__node_cache__.length <= id)
    __node_cache__.push(null);

  var cache = __node_cache__[id];

  if (cache)
    return cache.exports;

  var mod = __node_modules__[id];
  var name = mod[0];
  var path = mod[1];
  var func = mod[2];
  var meta;

  var _exports = exports;
  var _module = module;

  if (id !== 0) {
    _exports = {};
    _module = {
      id: '/' + name + path,
      exports: _exports,
      parent: module.parent,
      filename: module.filename,
      loaded: false,
      children: module.children,
      paths: module.paths
    };
  }

  __node_cache__[id] = _module;

  try {
    func.call(_exports, _exports, _module,
              __filename, __dirname, meta);
  } catch (e) {
    __node_cache__[id] = null;
    throw e;
  }

  __node_modules__[id] = null;

  if (id !== 0)
    _module.loaded = true;

  return _module.exports;
}

__node_require__(0);
}]
];

var __browser_cache__ = [];

function __browser_error__(location) {
  var err = new Error('Cannot find module \'' + location + '\'');
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}

function __fake_require__(location) {
  __browser_error__(location);
}

__fake_require__.cache = { __proto__: null };

__fake_require__.extensions = { __proto__: null };

__fake_require__.main = null;

__fake_require__.resolve = __browser_error__;

__fake_require__.resolve.paths = __browser_error__;

function __browser_require__(id, parent) {
  if ((id >>> 0) !== id || id > __browser_modules__.length)
    return __browser_error__(id);

  if (parent != null && !parent.children)
    return __browser_error__(id);

  while (__browser_cache__.length <= id)
    __browser_cache__.push(null);

  var cache = __browser_cache__[id];

  if (cache)
    return cache.exports;

  var mod = __browser_modules__[id];
  var name = mod[0];
  var path = mod[1];
  var func = mod[2];

  var filename = path;
  var dirname = filename.split('/').slice(0, -1).join('/') || '/';
  var meta;

  var _require = __fake_require__;
  var _exports = {};

  var _module = {
    id: '/' + name + path,
    exports: _exports,
    parent: parent,
    filename: filename,
    loaded: false,
    children: [],
    paths: ['/'],
    require: _require
  };

  if (parent)
    parent.children.push(_module);

  if (id === 0)
    _require.main = _module;

  if (id === 0)
    process.mainModule = _module;

  __browser_cache__[id] = _module;

  try {
    func.call(_exports, _exports, _require,
              _module, filename, dirname, meta);
  } catch (e) {
    __browser_cache__[id] = null;
    throw e;
  }

  __browser_modules__[id] = null;

  _module.loaded = true;

  return _module.exports;
}

;(function() {
  var timers = __browser_require__(24, null);

  setTimeout = timers.setTimeout;
  clearTimeout = timers.clearTimeout;
  setInterval = timers.setInterval;
  clearInterval = timers.clearInterval;
  setImmediate = timers.setImmediate;
  clearImmediate = timers.clearImmediate;
})();

process = __browser_require__(25, null);

Buffer = __browser_require__(26, null).Buffer;

var __browser_main__ = __browser_require__(0, null);
})(function() {
  if (typeof window !== 'undefined' && window.Math === Math)
    return window;

  if (typeof self !== 'undefined' && self.Math === Math)
    return self;

  return Function('return this')();
}());
