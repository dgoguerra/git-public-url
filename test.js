var tape = require('tape'),
    publicUrl = require('./index.js');


tape('github commit', function(t) {
    publicUrl(process.cwd(), {commit: 'c177a45'}, function(err, publicUrl) {
        t.equal(publicUrl, 'https://github.com/dgoguerra/git-public-url/commit/c177a45cad0e5692c2c5d9ea400a636b7692821c');
        t.end();
    });
});

tape('github file', function(t) {
    publicUrl(process.cwd(), {commit: 'c177a45', file: 'package.json'}, function(err, publicUrl) {
        t.equal(publicUrl, 'https://github.com/dgoguerra/git-public-url/blob/c177a45cad0e5692c2c5d9ea400a636b7692821c/package.json');
        t.end();
    });
});
