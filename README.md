# impulse-bin

node.js CLI module runner

* Adapters for [commander.js](https://github.com/visionmedia/commander.js) and [node-optimist](https://github.com/substack/node-optimist)
* Basic set of [long-con](https://github.com/codeactual/long-con) console loggers for stdout/stderr/verbose with [color](https://github.com/medikoo/cli-color)

[![Build Status](https://travis-ci.org/codeactual/impulse-bin.png)](https://travis-ci.org/codeactual/impulse-bin)

## Purpose

* CLI scripts that are easier to test without running the executable.
* Reduce boilerplate.

## Example

### `bin/myproj`

Executables are reduced to thin loading calls.

```js
var bin = require('impulse-bin').create();
bin.run(require('commander'), require('./lib/cli/myproj'));

// Or if your CLI module's run() function is a generator:
bin.runGenerator(require('commander'), require('./lib/cli/myproj'));
```

### `lib/cli/myproj.js`

While the rest is separated into input parsing and input consumption.

* `init()` receives a CLI input `provider` like `commander.js` or `node-optimist` for you to configure.
* `run()` receives the parsed `this.options` and `this.args` from the `provider`.

```js
exports.init = function(provider) {
  provider.option('-c, --config <dir>', 'Config file');
};

exports.run = function() {
  this.exitOnMissingOption(['config']);

  this.stdout('using config file: %s', this.clc.green(this.options.config));

  // ...
};
```

### Pass arguments from `bin/myproj` to the `lib/cli/myproj.js`

```js
// bin/myproj
bin.run(require('commander'), require('./lib/cli/myproj'), 1, 2, 3);

// lib/cli/myproj.js
exports.run = function() {
  console.log([].slice.call(arguments)); // [1, 2, 3]
};
```

## Installation

### [NPM](https://npmjs.org/package/impulse-bin)

[![NPM](https://nodei.co/npm/impulse-bin.png?downloads=true)](https://nodei.co/npm/impulse-bin/)

    npm install impulse-bin

## Documentation

* [exports.run()](docs/exports-run.md)
* [API](docs/ImpulseBin.md)

## License

  MIT

## Tests

    npm test
