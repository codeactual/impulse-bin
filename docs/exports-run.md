# `exports.run()`

## Properties in `this`

* `{object} provider`: `commander.js`, `node-optimist`, etc.

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

* `{function} createVerbose`: [docs](ImpulseBin.md)
* `{function} stderr`: [long-con logger](https://github.com/codeactual/long-con/blob/master/docs/LongCon.md)
* `{function} stdout`: [long-con logger](https://github.com/codeactual/long-con/blob/master/docs/LongCon.md)
* `{function} verbose`: `console.log` wrapper made by `createVerbose()`

Process:

* `{function} exit`: [docs](docs/ImpulseBin.md)
* `{function} exitOnMissingOption`: [docs](ImpulseBin.md)
* `{function} exitOnShelljsErr`: [docs](ImpulseBin.md)
