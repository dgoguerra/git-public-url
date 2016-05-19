var _ = require('lodash'),
    async = require('async'),
    parseRepo = require('parse-repo'),
    spawn = require('child_process').spawn;

function revisionIsTag(commitRev, next) {
    spawn('git', ['describe', '--exact-match', commitRev])
        .on('close', function(code) {
            next(null, code === 0);
        });
}

function getTagPointedCommit(tagName, next) {
    var commitHash = null;

    spawn('git', ['rev-list', '-n', '1', tagName])
        .on('close', function(code) {
            if (code !== 0 || !commitHash) {
                return next(new Error("unknown tag '"+tagName+"'"));
            }
            next(null, commitHash);
        })
        .stdout.on('data', function(data) {
            commitHash = data.toString().trim();
        });
}

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

function getCommitHash(commitRev, next) {
    var commitHash = null;

    spawn('git', ['rev-parse', '--revs-only', commitRev])
        .on('close', function(code) {
            if (code !== 0 || !commitHash) {
                return next(new Error("unknown commit revision '"+commitRev+"'"));
            }
            next(null, commitHash);
        })
        .stdout.on('data', function(data) {
            commitHash = data.toString().trim();
        });
}

function getRevisionHash(commitRev, next) {
    var commitHash = null;

    // first check if the given revision is a tag. If it is, then find
    // the commit the tag is pointing to, instead of the tag's commit
    revisionIsTag(commitRev, function(err, isTag) {
        if (err) return next(err);

        if (isTag) {
            getTagPointedCommit(commitRev, next);
        } else {
            getCommitHash(commitRev, next);
        }
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

function buildUrl(repoDir, opts, next) {
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
            getRevisionHash(opts.commit || 'HEAD', next);
        }
    }, function(err, results) {
        if (err) return next(err);

        var repo = parseRepo(results.remoteUri),
            commit = results.commitHash,
            file = opts.file || null,
            url = null;

        if (repo.host === 'bitbucket.org') {
            url = buildBitbucketUrl(repo.host, repo.owner, repo.project, commit, file);
        }

        if (repo.host === 'github.com') {
            url = buildGithubUrl(repo.host, repo.owner, repo.project, commit, file);
        }

        next(null, url);
    });
}

module.exports = buildUrl;
