# node-wget-fetch

[![NPM](https://nodei.co/npm/node-wget-fetch.png)](https://nodei.co/npm/node-wget-fetch/)

[![Dependencies Status][david-image]][david-url] [![Node.js CI](https://github.com/techno-express/node-wget-fetch/workflows/Node.js%20CI/badge.svg)](https://github.com/techno-express/node-wget-fetch/actions) [![Maintainability][codeclimate-image]][codeclimate-url][![Release][npm-image]][npm-url]

Ultra simple async retrieval of resources or remote files over http or https, an cli tool, and convenience wrapper of [node-fetch](https://www.npmjs.com/package/node-fetch).

## Install

```bash
npm install node-wget-fetch
```

### fetching(url, destination | responseType | options [, options])

- `url` A string representing an absolute url
- `options` Standard *Request/Fetch* [Options](https://www.npmjs.com/package/node-fetch#fetch-options) for the HTTP(S) request
- Returns: **Promise** of Response

## Usage

```javascript
const fetching = require('node-wget-fetch');

fetching.wget(url) // retrieve to current directory
    .then((info) => {});
    .catch((error) => {});

fetching.wget(url, { headers:  { Accept: '*/*' } }) // with optional `Fetch` options
    .then((info) => {});
    .catch((error) => {});

fetching.wget(url, destination_folder_or_filename, { timeout: 2000 } )  // with optional `Fetch` options
    .then((info) => {});
    .catch((error) => {});


fetching(url, responseType, // *responseType* can be:
    // 'header' for all response headers - raw()
    // 'object' for the response object - no post/pre processing
    // 'array' for arrayBuffer()
    // 'buffer' for buffer()
    // 'blob' for blob()
    // 'json' for json()
    // 'text' for text()
    // 'converted' for textConverted()
    // 'stream' for NodeJs.readableStream()
    // default is 'download'
    { headers: {Accept: '*/*' } }) // with optional `Fetch` options
    )
    .then((processedResponse) => {
        // No file is retrieved or saved,
        // an resolved `Fetch` response body of above type is returned
    });
    .catch((error) => {});
```

## Examples

```javascript
const wget = require('node-wget-fetch');

wget('https://raw.github.com/techno-express/node-wget-fetch/master/angleman.png'); // angleman.png saved to current folder

wget('https://raw.github.com/techno-express/node-wget-fetch/master/package.json',
    '/tmp/', // destination path or path with filename, default is ./
    { timeout: 2000 } // Any `Fetch` Options, this sets duration to wait for request in milliseconds, default 0
    )
    .then((info) => {
        console.log('--- headers:'); // display all response headers
        console.log(info.headers);
        console.log('--- file path:'); // display file retrieved info
        console.log(info.filepath);
        console.log('--- file size retrieved:');
        console.log(info.fileSize);
        console.log('--- Do file retrieved match "Content-Length"?:');
        console.log(info.retrievedSizeMatch);
    })
    .catch((error) => {
        console.log('--- error:');
        console.log(error); // error encountered
    });
);
```

## CLI

Install:

```bash
npm install -g node-wget-fetch
```

Use:

```text
Usage: wget [options] <url>

Or

Usage: fetch [options] <url>

Ultra simple async retrieval of remote files over http or https

Options:

  -h, --help                        output usage information
  -v, --version                     output version number
  -d, --destination <folder>        specify download destination

Usage:

# Download file
$ wget https://github.com/NodeOS/NodeOS/archive/master.zip
$ fetch https://github.com/NodeOS/NodeOS/archive/master.zip

# Download file to location
$ wget https://github.com/NodeOS/NodeOS/archive/master.zip -d path/to/here/
$ fetch https://github.com/NodeOS/NodeOS/archive/master.zip -d path/to/here/
```

## License: MIT

[david-url]: https://david-dm.org/techno-express/node-wget-fetch
[david-image]: http://img.shields.io/david/techno-express/node-wget-fetch.svg
[codeclimate-url]: https://codeclimate.com/github/techno-express/node-wget-fetch/maintainability
[codeclimate-image]: https://api.codeclimate.com/v1/badges/0d6a0bc69a8ea29c7de9/maintainability
[coveralls-url]: https://coveralls.io/github/techno-express/node-wget-fetch
[coveralls-image]: https://coveralls.io/repos/github/techno-express/node-wget-fetch/badge.svg
[npm-url]: https://www.npmjs.org/package/node-wget-fetch
[npm-image]: http://img.shields.io/npm/v/node-wget-fetch.svg
