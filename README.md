# node-wget-js

[![Dependencies Status][david-image]][david-url] [![Build Status](https://travis-ci.org/techno-express/node-wget.png?branch=master)](https://travis-ci.org/techno-express/node-wget) [![Code coverage][coveralls-image]][coveralls-url] [![Maintainability][codeclimate-image]][codeclimate-url][![Release][npm-image]][npm-url]

Ultra simple async retrieval of remote files over http or https inspired by wgetjs.

This is a fork of [node-wget](https://www.npmjs.com/package/node-wget), which still uses [request](https://www.npmjs.com/package/request) that's now deprecated and using the vulnerability version.

This package is rewritten to use [node-fetch](https://www.npmjs.com/package/node-fetch).

## Install

```
npm install node-wget-js
```

## Usage

```javascript
var wget = require('node-wget-js');

wget(url);

wget(url, callback);

wget({url: url, dest: destination_folder_or_filename}, callback);

wget({url: url, dry: true}); // dry run, nothing loaded, callback passing parsed options as data
```

## Examples

```javascript
var wget = require('node-wget-js');

wget('https://raw.github.com/techno-express/node-wget/master/angleman.png');   // angleman.png saved to current folder

wget({
        url:  'https://raw.github.com/techno-express/node-wget/master/package.json',
        dest: '/tmp/',      // destination path or path with filenname, default is ./
        timeout: 2000       // duration to wait for request fulfillment in milliseconds, default is 2 seconds
    },
    function (error, response, body) {
        if (error) {
            console.log('--- error:');
            console.log(error);            // error encountered
        } else {
            console.log('--- headers:');
            console.log(response.headers); // response headers
            console.log('--- body:');
            console.log(body);             // content of package
        }
    }
);

// dry run
wget({
    url: 'https://raw.github.com/techno-express/node-wget/master/package.json',
    dest: '/tmp/',
    dry: true
    }, function(err, data) {        // data: { headers:{...}, filepath:'...' }
        console.log('--- dry run data:');
        console.log(data); // '/tmp/package.json'
    }
);
```

## CLI

Install:

```bash
$ npm install -g node-wget-js
```

Use:

```text
Usage: wget [options] <url>

Ultra simple async retrieval of remote files over http or https

Options:

  -h, --help                        output usage information
  -v, --version                     output version number
  -d, --destination <folder>        specify download destination

Usage:

# Download file
$ wget https://github.com/NodeOS/NodeOS/archive/master.zip

# Download file to location
$ wget https://github.com/NodeOS/NodeOS/archive/master.zip -d path/to/here/
```

## License: MIT

[david-url]: https://david-dm.org/techno-express/node-wget
[david-image]: http://img.shields.io/david/techno-express/node-wget.svg
[appveyor-url]: https://ci.appveyor.com/project/techno-express/node-wget
[appveyor-image]: https://ci.appveyor.com/api/projects/status/sivpio3bq2k3070a/branch/master?svg=true
[codeclimate-url]: https://codeclimate.com/github/techno-express/node-wget/maintainability
[codeclimate-image]: https://api.codeclimate.com/v1/badges/0d6a0bc69a8ea29c7de9/maintainability
[coveralls-url]: https://coveralls.io/github/techno-express/node-wget
[coveralls-image]: https://coveralls.io/repos/github/techno-express/node-wget/badge.svg
[npm-url]: https://www.npmjs.org/package/node-wget-js
[npm-image]: http://img.shields.io/npm/v/node-wget-js.svg
