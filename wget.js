const fs = require('fs'),
	fetch = require('node-fetch');


function wget(options, callback) {
	if (typeof options === 'string') {
		options = {
			url: options
		};
	}
	options = options || {};
	callback = callback || function () {};
	var src = options.url || options.uri || options.src,
		parts = src.split('/'),
		file = parts[parts.length - 1];
	parts = file.split('?');
	file = parts[0];
	parts = file.split('#');
	file = parts[0];
	options.dest = options.dest || './';
	if (options.dest.substr(options.dest.length - 1, 1) == '/') {
		options.dest = options.dest + file;
	}

	timer = options.timeout || 2000;

	function handle_request_callback(err, res, body) {
		if (err) {
			callback(err);
		} else {
			var data = {
				filepath: options.dest
			};
			if (res && res.headers) {
				data.headers = res.headers;
			}
			callback(err, data, body);
		}
	}

	if (options.dry) {
		handle_request_callback(null, {}, {
			filepath: options.dest
		});
		return options.dest;
	} else {
		fetch(src, {
				timeout: timer
			})
			.then(res => {
				res.body.pipe(fs.createWriteStream(options.dest));
				handle_request_callback(null, {
					headers: res.headers.raw()
				}, {
					bodyUsed: res.bodyUsed,
					size: res.size,
					timeout: res.timeout
				});
			})
			.catch(err => callback(err));
	}
}

module.exports = wget;
