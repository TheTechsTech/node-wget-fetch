#!/usr/bin/env node

'use strict';

/* eslint-disable no-process-exit */

/*
 * Dependencies.
 */

import { wget } from './';
const require = createRequire(import.meta.url);
const pack = require('../package.json');

/*
 * Arguments.
 */

let argv = process.argv.slice(2);

/*
 * Command.
 */

let command = Object.keys(pack.bin)[0];

/**
 * Help.
 *
 * @return {string}
 */
function help() {
  return [
    '',
    'Usage: ' + command + ' [options] [url]...',
    '',
    pack.description,
    '',
    'Options:',
    '',
    '  -h, --help           output usage information',
    '  -v, --version        output version number',
    '',
    'Usage:',
    '',
    '# Download file',
    '$ ' + command + ' https://github.com/NodeOS/NodeOS/archive/master.zip',
    ''
  ].join('\n  ') + '\n';
}

/*
 * Program.
 */

if (
  argv.indexOf('--help') !== -1 ||
  argv.indexOf('-h') !== -1
) {
  console.log(help());
} else if (
  argv.indexOf('--version') !== -1 ||
  argv.indexOf('-v') !== -1
) {
  console.log(pack.version);
} else if (argv.length) {
  let destinationIndex = argv.indexOf('--destination') + argv.indexOf('-d') + 2;

  let args = {};
  if (destinationIndex) {
    args.dest = argv[destinationIndex];
    argv.splice(destinationIndex - 1, 2);
  }
  args.url = firstNonFlag(argv);
  if (args.url.length > 0) {
    console.log("Downloading...");
    wget(args.url, args.dest, { retry: { retries: 5 } })
      .then((info) => {
        console.log('Done!');
        console.log('The file ' + info.filepath + ' size' +
          (info.fileSizeMatch ? '' : " don't") + ' match!');
      })
      .catch((error) => {
        console.log('--- error:');
        console.log(error);
      });
  } else {
    console.log(help());
  }
} else {
  console.log(help());
}

function firstNonFlag(args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i].charAt(0) != '-') {
      return args[i];
    }
  }
  return "";
}
