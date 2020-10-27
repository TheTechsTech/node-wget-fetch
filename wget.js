'use strict';

const fs = require('fs'),
	fetch = require('node-fetch');

/**
 * Retrieval of remote files over http or https using `node-fetch`
 *
 * @param String url Absolute url of source
 * @param Mixed action Save destination or Body action on Response
 * @param Object options Fetch/Request options
 *
 * @return Promise
 */
function wget(url, action, options = {}) {
	if (typeof action === 'string' && ['array', 'buffer', 'blob', 'json', 'text', 'converted', 'stream'].includes(action)) {
		options.action = action;
		options.dest = './';
	} else {
		options.dest = action || './';
	}

	var src = url || options.uri || options.url || options.href,
		parts = src.split('/'),
		file = parts[parts.length - 1];
	parts = file.split('?');
	file = parts[0];
	parts = file.split('#');
	file = parts[0];
	if (options.dest.substr(options.dest.length - 1, 1) == '/') {
		options.dest = options.dest + file;
	}

	if (options.dry) {
		return new Promise((resolve) => {
			resolve({
				filepath: options.dest
			});
		});
	} else {
		return fetch(src, options)
			.then(res => {
				switch (options.action) {
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
							const writer = fs.createWriteStream(options.dest);
							res.body.pipe(writer);

							writer.on('finish', () => {
								var data = {
									filepath: options.dest
								};

								data.headers = res.headers.raw();
								data.bodyUsed = res.bodyUsed;
								return resolve(data);
							});
							writer.on('error', reject);
						});
				}
			})
			.catch(err => console.log(err));
	}
}

module.exports = wget;
