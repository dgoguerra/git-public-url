#!/usr/bin/env node

var minimist = require('minimist'),
    publicUrl = require('./index.js');

var argv = minimist(process.argv.slice(2), {'--': true}),
    opts = {};

var commitRef = null,
    fileName = null;

if (argv._.length) {
    commitRef = argv._[0];
}

if (argv['--'].length) {
    fileName = argv['--'][0];
}

if (commitRef) {
    opts.commit = commitRef;
}

if (fileName) {
    opts.file = fileName;
}

if (argv.remote) {
    opts.remote = argv.remote;
}

publicUrl(argv.dir || process.cwd(), opts, function(err, publicUrl) {
    if (err) {
        console.error('error: '+err.message);
        return;
    }

    console.log(publicUrl);
});
