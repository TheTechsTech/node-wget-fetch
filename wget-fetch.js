'use strict';

import {
    createWriteStream
} from 'fs';
import fetch from 'node-fetch';

let content_types = {
    json: 'application/json; charset=utf-8',
    text: 'application/x-www-form-urlencoded',
    blob: 'application/octet',
    buffer: 'application/octet',
    header: 'text/plain',
    object: 'application/json; charset=utf-8',
    stream: 'application/octet',
    array: 'application/octet'
}

/**
 * Returns a promise that conditionally tries to resolve multiple times,
 * as specified by the policy.
 *
 * @param {object} options - Either An object that specifies the retry policy.
 * An object that specifies the retry policy.
 *
 * ```
 * retry:
 * {
 *  retries: `1` - The maximum amount of times to retry the operation.
 *  factor: `2` - The exponential factor to use.
 *  minTimeout: `1000` - The number of milliseconds before starting the first retry.
 *  maxTimeout: `Infinity` - The maximum number of milliseconds between two retries.
 *  randomize: `false` - Randomizes the timeouts by multiplying with a factor between 1 to 2.
 * }
 * ```
 * @param {function} executor - A function that is called for each attempt to resolve the promise.
 * Executor function called as `(resolveFn, retryFn, rejectFn)`;
 *  - `resolveFn` - To be called when the promise resolves normally.
 *  - `retryFn` - To be called when the promise failed and a retry may be attempted.
 *  - `rejectFn` - To be called when the promise failed and no retry should be attempted.
 *
 * @returns {Promise}
 */
export const retryPromise = fetching.retryPromise = function (options, executor) {
    if (executor == undefined) {
        executor = options;
        options = {};
    }

    /*
     * Preps the options object, initializing default values and checking constraints.
     */
    let opts = {
        retries: 1,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: Infinity,
        randomize: false
    };

    for (let key in options) {
        opts[key] = options[key];
    }

    if (opts.minTimeout > opts.maxTimeout) {
        throw new Error('minTimeout is greater than maxTimeout');
    }

    var attempts = 1;

    return new Promise((resolve, reject) => {
        let retrying = false;

        function retry(err) {
            if (retrying) return;
            retrying = true;

            /**
             * Get a timeout value in milliseconds.
             */
            let random = opts.randomize ? Math.random() + 1 : 1;
            let timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempts));
            timeout = Math.min(timeout, opts.maxTimeout);
            if (attempts < opts.retries) {
                setTimeout(() => {
                    attempts++;
                    retrying = false;
                    executor(resolve, retry, reject, attempts);
                }, timeout);
            } else {
                reject(err);
            }
        }

        executor(resolve, retry, reject, attempts);
    });
}

/**
 * Retrieval of resources or remote files over http or https by way of `node-fetch`
 *
 * @param {String} url Absolute url of source
 * @param {Mixed} action Save to `destination` or body `action` on `response type` or use for `options`
 *
 * **response type** can be:
 * - '`header`' for all response headers - **raw()**
 * - '`object`' for the response object - **no post/pre processing**
 * - '`array`' for **arrayBuffer()**
 * - '`buffer`' for **buffer()**
 * - '`blob`' for **blob()**
 * - '`json`' for **json()**
 * - '`text`' for **text()**
 * - '`stream`' for **NodeJs.readableStream()**
 *
 * **default is '`download`'**
 * @param {Object} options Fetch/Request options
 * @return {Promise} Promise of `response body` of above **type**, only if **status text** is `OK`
 */
function fetching(url, action = '', options = {}) {
    let src = url,
        destination = action || './',
        parts = src.split('/'),
        file = parts[parts.length - 1];

    parts = file.split('?');
    file = parts[0];
    parts = file.split('#');
    file = parts[0];

    if (isString(action) && ['header', 'object', 'array', 'buffer', 'blob', 'json', 'text', 'stream'].includes(action)) {
        destination = './';
        options.action = action;
    } else if (isObject(action)) {
        options = Object.assign(options, action);
        destination = './';
        action = 'stream';
    } else {
        action = 'download';
    }

    if (options.action) {
        action = options.action;
        delete options.action;
    }

    let retryPolicy = {};
    if (options.retry) {
        retryPolicy = options.retry;
        delete options.retry;
    }

    if (destination.substr(destination.length - 1, 1) == '/') {
        destination = destination + file;
    }

    if (options.dry) {
        return new Promise((resolve) => resolve({
            filepath: destination
        }));
    } else {
        return new retryPromise(retryPolicy, (resolve, retry) => {
            fetch(src, options)
                .then(res => {
                    if (res.statusText === 'OK' || res.ok) {
                        switch (action) {
                            case 'header':
                                return resolve(res.headers.raw());
                            case 'object':
                                return resolve(res);
                            case 'array':
                                return resolve(res.arrayBuffer());
                            case 'buffer':
                                return resolve(res.buffer());
                            case 'blob':
                                return resolve(res.blob());
                            case 'json':
                                return resolve(res.json());
                            case 'text':
                                return resolve(res.text());
                            case 'stream':
                                return resolve(res.body);
                            default:
                                const fileSize = parseInt(res.headers.get('content-length'));
                                let downloadedSize = 0;
                                const writer = createWriteStream(destination, {
                                    flags: 'w+',
                                    encoding: 'binary'
                                });
                                res.body.pipe(writer);

                                res.body.on('data', (chunk) => {
                                    downloadedSize += chunk.length;
                                });

                                writer.on('finish', () => {
                                    writer.end();
                                    let info = {
                                        filepath: destination,
                                        fileSize: downloadedSize,
                                        fileSizeMatch: (fileSize === downloadedSize)
                                    };
                                    info.headers = res.headers.raw();
                                    return resolve(info);
                                });
                                writer.on('error', (err) => {
                                    writer.end();
                                    return retry(err);
                                });
                        }
                    } else {
                        throw ("Fetch to " + src + " failed, with status text: " + res.statusText);
                    }
                })
                .catch((err) => retry(err));
        }).catch((err) => {
            return new Promise((resolve, reject) => reject(err));
        });
    }
}

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
export const isArray = fetching.isArray = function (val) {
    return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
export const isUndefined = fetching.isUndefined = function (val) {
    return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
export const isBuffer = fetching.isBuffer = function (val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) &&
        typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
export const isArrayBuffer = fetching.isArrayBuffer = function (val) {
    return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
export const isString = fetching.isString = function (val) {
    return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
export const isNumber = fetching.isNumber = function (val) {
    return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
export const isObject = fetching.isObject = function (val) {
    return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
export const isPlainObject = fetching.isPlainObject = function (val) {
    if (toString.call(val) !== '[object Object]') {
        return false;
    }

    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
export const isBlob = fetching.isBlob = function (val) {
    return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
export const isFunction = fetching.isFunction = function (val) {
    return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
export const isDate = fetching.isDate = function (val) {
    return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
export const isStream = fetching.isStream = function (val) {
    return isObject(val) && isFunction(val.pipe);
}

/**
 * Fetch the given `url` by created functions methods of patch, post, put, delete
 * @param url - URL string.
 * @param body - Data to send
 * - Note: `body` data is passed in, handled by **URLSearchParams** _class_, if `String` or `Object`.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type, only if **status text** is `OK`
 */
function verbFuncBody(verb) {
    let method = verb.toUpperCase();
    return function (uri, body = null, responseType = 'text', options = {}) {
        let params = {
            headers: {
                'Content-Type': null
            }
        };
        params.method = method;
        params.action = responseType;
        params.headers['Content-Type'] = content_types[responseType] || 'application/x-www-form-urlencoded';
        params.body = ((isString(body) && body.includes('=', '&')) || (isObject(body))) ? new URLSearchParams(body) : body;
        params = Object.assign(params, options);
        return fetching(uri, params);
    }
}

/**
 * Fetch the given `url` by created functions for methods of head, options, get
 *
 * @param url - URL string.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response of headers, only if **status text** is `OK`
 */
function verbFunc(verb) {
    let method = verb.toUpperCase();
    return function (uri, responseType = 'header', options = {}) {
        let params = options;
        params.action = responseType;
        params.method = method;
        return fetching(uri, params);
    }
}

/**
 * Retrieve remote file over http or http
 *
 * @param {String} url Absolute url of source
 * @param {Mixed} folderFilename Save to destination or use for options
 * @param {Object} options Fetch/Request options
 *
 * @return {Promise} `Promise` **info** of completed file transfer:
 * - { filepath: string, fileSize: number, fileSizeMatch: boolean, headers: object}, only if **status text** is `OK`
 */
function _wget(url, folderFilename = './', options = {}) {
    let params = options;
    if (isObject(folderFilename)) {
        params = Object.assign(params, folderFilename);
        folderFilename = './';
    }
    params.action = 'download';
    return fetching(url, folderFilename, params);
}

/**
 * Retrieve remote file over http or http
 *
 * @param {String} url Absolute url of source
 * @param {Mixed} folderFilename Save to destination or use for options
 * @param {Object} options Fetch/Request options
 *
 * @return {Promise} `Promise` info of completed file transfer:
 * - { filepath: string, fileSize: number, retrievedSizeMatch: boolean, headers: object}, only if **status text** is `OK`
 */
export const wget = fetching.wget = _wget;

/**
 * Fetch the given `url` by header `GET` method
 *
 * @param url - URL string.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response of headers, only if **status text** is `OK`
 */
export const get = fetching.get = verbFunc('get');

/**
 * Fetch the given `url` by header `HEAD` method
 *
 * @param url - URL string.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response of headers, only if **status text** is `OK`
 */
export const head = fetching.head = verbFunc('head');

/**
 * Fetch the given `url` by header `OPTIONS` method
 *
 * @param url - URL string.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response of headers, only if **status text** is `OK`
 */
export const options = fetching.options = verbFunc('options');

/**
 * Fetch the given `url` by header `POST` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * - Note: `body` data is passed in, handled by **URLSearchParams** _class_, if `String` or `Object`.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type, only if **status text** is `OK`
 */
export const post = fetching.post = verbFuncBody('post');

/**
 * Fetch the given `url` by header `PUT` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * - Note: `body` data is passed in, handled by **URLSearchParams** _class_, if `String` or `Object`.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type, only if **status text** is `OK`
 */
export const put = fetching.put = verbFuncBody('put');

/**
 * Fetch the given `url` by header `PATCH` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * - Note: `body` data is passed in, handled by **URLSearchParams** _class_, if `String` or `Object`.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type, only if **status text** is `OK`
 */
export const patch = fetching.patch = verbFuncBody('patch');

/**
 * Fetch the given `url` by header `DELETE` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * - Note: `body` data is passed in, handled by **URLSearchParams** _class_, if `String` or `Object`.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type, only if **status text** is `OK`
 */
export const del = fetching.del = verbFuncBody('delete');
export {
    del as delete
};

/**
 * Fetch the given `url` by header `DELETE` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * - Note: `body` data is passed in, handled by **URLSearchParams** _class_, if `String` or `Object`.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type, only if **status text** is `OK`
 */
fetching['delete'] = verbFuncBody('delete');

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
fetching.fetch = fetch;

export default fetching;
