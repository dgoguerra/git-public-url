var _ = require('lodash'),
    async = require('async'),
    parseRepo = require('parse-repo'),
    commitHash = require('commit-hash'),
    spawn = require('child_process').spawn;

function getRemoteUri(remoteName, next) {
    var remoteUri = null;

    spawn('git', ['config', '--get', 'remote.'+remoteName+'.url'])
        .on('close', function(code) {
            if (code !== 0 || !remoteUri) {
                return next(new Error("unknown remote '"+remoteName+"'"));
            }
            next(null, remoteUri);
        })
        .stdout.on('data', function(data) {
            remoteUri = data.toString().trim();
        });
}

function fileExistsInRevision(commitRev, fileName, next) {
    spawn('git', ['show', commitRev+':'+fileName], {stdio: 'ignore'})
        .on('close', function(code) {
            next(null, code === 0);
        });
}

function buildBitbucketUrl(host, owner, project, commitHash, file) {
    var url = 'https://'+host+'/'+owner+'/'+project;

    if (file) {
        url += '/src/'+commitHash+'/'+_.trim(file, '/');
    } else if (commitHash) {
        url += '/commits/'+commitHash;
    }

    return url;
}

function buildGithubUrl(host, owner, project, commitHash, file) {
    var url = 'https://'+host+'/'+owner+'/'+project;

    if (file) {
        url += '/blob/'+commitHash+'/'+_.trim(file, '/');
    } else if (commitHash) {
        url += '/commit/'+commitHash;
    }

    return url;
}

function buildUrl(remoteUri, commitHash, fileName) {
    var repo = parseRepo(remoteUri),
        url = null;

    if (repo.host === 'bitbucket.org') {
        url = buildBitbucketUrl(repo.host, repo.owner, repo.project, commitHash, fileName);
    }

    if (repo.host === 'github.com') {
        url = buildGithubUrl(repo.host, repo.owner, repo.project, commitHash, fileName);
    }

    return url;
}


function publicUrl(repoDir, opts, next) {
    if (typeof next === 'undefined') {
        next = opts;
        opts = {};
    }

    process.chdir(repoDir);

    async.parallel({
        remoteUri: function(next) {
            getRemoteUri(opts.remote || 'origin', next);
        },
        commitHash: function(next) {
            commitHash(opts.commit || 'HEAD', next);
        }
    }, function(err, results) {
        if (err) return next(err);

        var remoteUri = results.remoteUri,
            commit = results.commitHash,
            fileName = opts.file || null;

        // if there is a file path, ensure that it exists in the destination commit
        if (fileName) {
            fileExistsInRevision(commit, fileName, function(err, exists) {
                if (err) return next(err);

                if (!exists) {
                    return next(new Error("file '"+fileName+"' doesn't exist in commit "+commit));
                }

                var url = buildUrl(remoteUri, commit, fileName);
                next(null, url);
            });
        } else {
            var url = buildUrl(remoteUri, commit, fileName);
            next(null, url);
        }
    });
}

module.exports = publicUrl;
