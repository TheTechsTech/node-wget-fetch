const fs = require('fs'),
    fetch = require('node-fetch');


function wget(options, callback) {
    if (typeof options === 'string') {
        options = {
            url: options
        };
    }
    options = options || {};
    callback = callback || function () { };
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

    if (options.dry) {
        return new Promise((resolve) => {
            resolve({
                filepath: options.dest
            });
        });
    } else {
        return new Promise((resolve, reject) => {
            fetch(src, {
                timeout: timer
            })
                .then(res => {
                    const writer = fs.createWriteStream(options.dest);
                    res.body.pipe(writer);

                    writer.on('finish', () => {
                        var data = {
                            filepath: options.dest
                        };

                        if (res && res.headers) {
                            data.headers = res.headers.raw();
                        }

                        data.bodyUsed = res.bodyUsed;
                        resolve(data);
                    });
                    writer.on('error', reject);
                })
                .catch(err => reject(err));
        });
    }
}

module.exports = wget;
