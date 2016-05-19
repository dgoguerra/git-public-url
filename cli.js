#!/usr/bin/env node

var open = require('open'),
    minimist = require('minimist'),
    publicUrl = require('./index.js');

var argOpts = {'--': true, boolean: ['open'], alias: {open: ['o']}},
    argv = minimist(process.argv.slice(2), argOpts),
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

    if (argv.open) {
        open(publicUrl);
    } else {
        console.log(publicUrl);
    }
});
