# impulse-bin

`bin/` script module loader

* Injects utilities for terminal colors, logging, ShellJS, etc.
* Adapters for commander.js and optimist

[![Build Status](https://travis-ci.org/codeactual/impulse-bin.png)](https://travis-ci.org/codeactual/impulse-bin)

## Goals

* CLI scripts that are easier to test without running the executable.
* Reduce boilerplate via utility functions and injected dependencies like ShellJS.

## Example

### `bin/myproj`

```js
var bin = require('impulse-bin').create();
bin.run(require('commander'), require('./lib/cli/myproj'));
```

### `lib/cli/myproj.js`

```js
exports.init = function(provider) {
  provider.option('-c, --config <dir>', 'Config file');
};

exports.run = function() {
  this.exitOnMissingOption(['config']);

  if (!this.shelljs._('test', '-f', this.options.config)) {
    this.stderr('config file not found: %s', this.options.config);
  }

  this.stdout('using config file: %s', this.clc.green(this.options.config));

  // ...
};
```

## Installation

### [NPM](https://npmjs.org/package/impulse-bin)

    npm install impulse-bin

## Handler Function API

### Properties available via `this`

* `{object} provider`: commander.js, optimist, etc.

CLI input:

* `{array} args`
* `{object} options`

Modules:

* `{object} child_process`
* `{object} console`: Create custom loggers via [long-con](https://github.com/codeactual/long-con)
* `{object} clc`: Terminal colors via [cli-color](https://github.com/medikoo/cli-color)
* `{object} fs`
* `{object} shelljs`: [outer-shelljs](https://github.com/codeactual/outer-shelljs)
* `{object} util`

Logging:

* `{function} createVerbose`: [mixin](docs/ImpulseBin.md)
* `{function} stderr`: [long-con logger](https://github.com/codeactual/long-con/blob/master/docs/LongCon.md)
* `{function} stdout`: [long-con logger](https://github.com/codeactual/long-con/blob/master/docs/LongCon.md)
* `{function} verbose`: `console.log` wrapper made by `createVerbose()`

Process:

* `{function} exit`: [mixin](docs/ImpulseBin.md)
* `{function} exitOnMissingOption`: [mixin](docs/ImpulseBin.md)
* `{function} exitOnShelljsErr`: [mixin](docs/ImpulseBin.md)

## API

[Documentation](docs/ImpulseBin.md)

## License

  MIT

## Tests

    npm test
