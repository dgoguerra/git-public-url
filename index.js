var _ = require('lodash'),
    async = require('async'),
    parseRepo = require('parse-repo'),
    spawn = require('child_process').spawn;

function getRemoteUri(remoteName, next) {
    spawn('git', ['config', '--get', 'remote.'+remoteName+'.url'])
        .stdout.on('data', function(data) {
            next(null, data.toString().trim());
        });
}

function getCommitHash(commitRef, next) {
    spawn('git', ['rev-parse', commitRef])
        .stdout.on('data', function(data) {
            next(null, data.toString().trim());
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
            getCommitHash(opts.commit || 'HEAD', next);
        }
    }, function(err, results) {
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
