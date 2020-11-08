'use strict';

const fs = require('fs'),
	fetch = require('node-fetch');

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
 * - '`converted`' for **textConverted()**
 * - '`stream`' for **NodeJs.readableStream()**
 *
 * **default is '`download`'**
 * @param {Object} options Fetch/Request options
 * @return {Promise} Promise of `response body` of above **type**
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

	if (isString(action) && ['header', 'object', 'array', 'buffer', 'blob', 'json', 'text', 'converted', 'stream'].includes(action)) {
		destination = './';
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

	if (destination.substr(destination.length - 1, 1) == '/') {
		destination = destination + file;
	}

	if (options.dry) {
		return new Promise((resolve) => resolve({
			filepath: destination
		}));
	} else {
		return fetch(src, options)
			.then(res => {
				if (res.statusText === 'OK') {
					switch (action) {
						case 'header':
							return new Promise((resolve) => resolve(res.headers.raw()));
						case 'object':
							return new Promise((resolve) => resolve(res));
						case 'array':
							return res.arrayBuffer();
						case 'buffer':
							return res.buffer();
						case 'blob':
							return res.blob();
						case 'json':
							return res.json();
						case 'text':
							return res.text();
						case 'converted':
							return res.textConverted();
						case 'stream':
							return new Promise((resolve) => resolve(res.body));
						default:
							return new Promise((resolve, reject) => {
								const fileSize = Number.isInteger(res.headers.get('content-length') - 0) ?
									parseInt(res.headers.get('content-length')) :
									0;
								let downloadedSize = 0;
								const writer = fs.createWriteStream(destination, {
									flags: 'w+',
									encoding: 'binary'
								});
								res.body.pipe(writer);

								res.body.on('data', function (chunk) {
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
								writer.on('error', reject);
							});
					}
				} else {
					throw ("Fetch to " + src + " failed, with status text: " + res.statusText);
				}
			})
			.catch(err => {
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
function isArray(val) {
	return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
	return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
	return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) &&
		typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
	return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
	return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
	return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
	return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
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
function isBlob(val) {
	return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
	return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
	return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
	return isObject(val) && isFunction(val.pipe);
}

/**
 * Fetch the given `url` by created functions methods of patch, post, put, delete
 * @param url - URL string.
 * @param body - Data to send.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type.
 */
function verbFuncBody(verb) {
	let method = verb.toUpperCase();
	return function (uri, body, responseType = 'text', options = {}) {
		var params = options;
		params.method = method;
		params.action = responseType;
		params.body = body;
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
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response of headers.
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
 * @return {Promise} `Promise` info of completed file transfer:
 * - { filepath: string, fileSize: number, retrievedSizeMatch: boolean, headers: object}
 */
function wget(url, folderFilename = './', options = {}) {
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
 * - { filepath: string, fileSize: number, retrievedSizeMatch: boolean, headers: object}
 */
fetching.wget = wget;

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
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response of headers.
 */
fetching.get = verbFunc('get');

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
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response of headers.
 */
fetching.head = verbFunc('head');

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
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response of headers.
 */
fetching.options = verbFunc('options');

/**
 * Fetch the given `url` by header `POST` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type.
 */
fetching.post = verbFuncBody('post');

/**
 * Fetch the given `url` by header `PUT` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type.
 */
fetching.put = verbFuncBody('put');

/**
 * Fetch the given `url` by header `PATCH` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type.
 */
fetching.patch = verbFuncBody('patch');

/**
 * Fetch the given `url` by header `DELETE` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type.
 */
fetching.del = verbFuncBody('delete');

/**
 * Fetch the given `url` by header `DELETE` method
 *
 * @param url - URL string.
 * @param body - Data to send.
 * @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
 * @param options optional `Fetch` options.
 * @returns A promise response body of given response action type.
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

module.exports = exports = fetching;
Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = exports;
exports.isArray = isArray;
exports.isArrayBuffer = isArrayBuffer;
exports.isBuffer = isBuffer;
exports.isString = isString;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isPlainObject = isPlainObject;
exports.isUndefined = isUndefined;
exports.isBlob = isBlob;
exports.isFunction = isFunction;
exports.isDate = isDate;
exports.isStream = isStream;
