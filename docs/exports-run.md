# `exports.run()`

## Properties in `this`

* `{object} provider`: [commander.js](https://github.com/visionmedia/commander.js), [node-optimist](https://github.com/substack/node-optimist), etc.

CLI input:

* `{array} args`
* `{object} options`

Modules:

* `{object} child_process`
* `{object} console`: [long-con](https://github.com/codeactual/long-con) to create custom loggers
* `{object} clc`: [cli-color](https://github.com/medikoo/cli-color)
* `{object} fs`
* `{object} shelljs`: [outer-shelljs](https://github.com/codeactual/outer-shelljs)
* `{object} util`

Prepared [long-con](https://github.com/codeactual/long-con/blob/master/docs/LongCon.md) loggers:

* `{function} stderr` 
* `{function} stdout`
* `{function} verbose`

Logging Utilities:

* `{function} createVerbose`: ([docs](ImpulseBin.md))

Process:

* `{function} exit`: ([docs](ImpulseBin.md))
* `{function} exitOnMissingOption`: ([docs](ImpulseBin.md))
* `{function} exitOnShelljsErr`: ([docs](ImpulseBin.md))
