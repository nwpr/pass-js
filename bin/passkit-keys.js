#!/usr/bin/env node
// vi:set ft=javascript:

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// parsing command-line arguments
function printUsage() {
  console.info('USAGE: passkit-keys ./path/to/dirWithPC12keys');
}

if (process.argv.length < 3) {
  printUsage();
  process.exit(1);
}

// check if given parameter is a path
const keysDirectory = path.resolve(process.argv[2]);
const stats = fs.statSync(keysDirectory);
if (!stats.isDirectory()) {
  console.error(`${process.argv[2]} is not a directory!`);
  printUsage();
  process.exit(1);
}

//Removed extracting WWDR CA, because it's included in repo now

// Convert all P12 files in the keys directory into PEM files.
//
// When exporting the Passbook certificate from Keychain, we get a P12 files,
// but to sign the certificate we need a PEM file.
console.info(
  'Generating PEM versions for all P12 keys at %s...',
  keysDirectory,
);
fs
  .readdirSync(keysDirectory)
  .filter(file => path.extname(file) === '.p12')
  .map(file => path.resolve(keysDirectory, file))
  .forEach(file => {
    const outputFile = file.replace(/p12$/, 'pem');
    if (fs.existsSync(outputFile)) {
      console.warn('Skipping %s, PEM already exists', file);
    } else {
      console.info('Generating PEM from file %s...', file);
      execFileSync('openssl', ['pkcs12', '-in', file, '-out', outputFile], {
        stdio: ['inherit', 'inherit', 'inherit'],
      });
    }
  });
