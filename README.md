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
ci
  .set('nativeRequire', require)
  .push(require('./lib/cli'))
  .run(commander);

// ./lib/cli/index.js
module.exports = {cli: cli};
function cli() {
  this.exitOnMissingOption(this.input, ['config']);

  // ...

  this.promise.resolve();
}
```

## Installation

### [Component](https://github.com/component/component)

Install to `components/`:

    $ component install codeactual/cli-mod

Build standalone file in `build/`:

    $ grunt dist

## API

### [method]

> [method desc]

## License

  MIT

## Tests

    npm install --devDependencies
    npm test

## Change Log

### 0.1.0

* [initial features]
