# cli-mod

Modules for commander.js

[![Build Status](https://travis-ci.org/codeactual/cli-mod.png)](https://travis-ci.org/codeactual/cli-mod)

## Goals

* CLI scripts that are easier to test without running the executable.
* Reduce boilerplate via utility functions and injected dependencies like ShellJS.

## Example

```js
// ./bin/cli
var ci = require('cli-mod').create();
ci.run(commander, require('./path/to/my/module'));

// ./lib/cli/index.js
module.exports = {cli: cli};
function cli() {
  this.exitOnMissingOption(this.input, ['config']);

  // ...

  this.promise.resolve();
}
```

## Installation

### [NPM](https://npmjs.org/package/codeactual-cli-mod)

    npm install codeactual-cli-mod

## API

```js
  this.stderr = this.createConsole('stderr', console.error, this.clc.red);
  this.stdout = this.createConsole('stdout', console.log);
  this.verbose = this.createConsole('verbose', util.debug);
```

### [method]

> [method desc]

## License

  MIT

## Tests

    npm test
