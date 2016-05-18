## git-public-url

Obtain the public URL to a commit or file of a local repo, to open or share quickly pushed code in a browser.

### Installation

```bash
npm install -g git-public-url
```

### Usage

`git-public-url` uses the git repository in the current directory.

```bash
$ cd git-public-url/
$ git config --get remote.origin.url
git@github.com:dgoguerra/git-public-url.git

# by default, generates the url to the current commit
$ git-public-url
https://github.com/dgoguerra/git-public-url/commit/bc069fee1d0d8f58eb3f54f5771f98399dd2ca19

# another commit ref can be provided
$ git-public-url v1.0.0
https://github.com/dgoguerra/git-public-url/commit/40f327b9e81b8a0fefa7772a2c9ea7cf7645fffc

# url to a file on the given commit
$ git-public-url c177a45 -- package.json
https://github.com/dgoguerra/git-public-url/blob/c177a45cad0e5692c2c5d9ea400a636b7692821c/package.json
```

### License

MIT license - http://www.opensource.org/licenses/mit-license.php
