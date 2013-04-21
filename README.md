# impulse-bin

Modules for commander.js

[![Build Status](https://travis-ci.org/codeactual/impulse-bin.png)](https://travis-ci.org/codeactual/impulse-bin)

## Goals

* CLI scripts that are easier to test without running the executable.
* Reduce boilerplate via utility functions and injected dependencies like ShellJS.

## Example

```js
// ./bin/cli
var ci = require('impulse-bin').create();
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

### [NPM](https://npmjs.org/package/codeactual-impulse-bin)

    npm install codeactual-impulse-bin

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
