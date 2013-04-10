# cmdr-input

Modules for commander.js

[![Build Status](https://travis-ci.org/codeactual/cmdr-input.png)](https://travis-ci.org/codeactual/cmdr-input)

## Goals

* CLI scripts that are easier to test without running the executable.
* Reduce boilerplate via utility functions and injected dependencies like ShellJS.

## Example

```js
// ./bin/cli
var ci = require('cmdr-input').create();
ci
  .set('nativeRequire', require)
  .push(require('./lib/cli'))
  .run(commander);

// ./lib/cli/index.js
module.exports = function() {
  this.exitOnMissingOption(this.input, ['config']);

  // ...

  this.promise.resolve();
};
```

## Installation

### [Component](https://github.com/component/component)

Install to `components/`:

    $ component install codeactual/cmdr-input

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
