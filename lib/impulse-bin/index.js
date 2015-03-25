/**
 * node.js CLI module runner
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

/**
 * Reference to ImpulseBin.
 */
exports.ImpulseBin = ImpulseBin;

/**
 * Create a new ImpulseBin.
 *
 * @return {object}
 */
exports.create = function() { return new ImpulseBin(); };

/**
 * Extend ImpulseBin.prototype.
 *
 * @param {object} ext
 * @return {object} Merge result.
 */
exports.extend = function(ext) { return extend(ImpulseBin.prototype, ext); };

var util = require('util');
var sprintf = util.format;

var configurable = require('configurable');
var extend = require('extend');

/**
 * ImpulseBin constructor.
 *
 *     var bin = require('impulse-bin').create();
 *
 * Example configuration:
 *
 *     bin
 *       .set('adapter', 'optimist')
 *       .set('quietOption', 'silent');
 *
 * Configuration:
 *
 * - `{string} [adapter='commander]` Valid name of adapter in `./lib/adapter/`
 * - `{string} [quietOption='quiet']` Silence all loggers on `--quiet`
 * - `{string} [requiredOptionTmpl='--%s is required']` `exitOnMissingOption()` message template
 * - `{string} [verboseOption='verbose']` Enable verbose logger on `--verbose`
 * - `{string} [verboseLogName='[verbose]']` Prepended to each message
 * - `{string} [stdoutLogName='[stdout]']` Prepended to each message
 * - `{string} [stderrLogName='[stderr]']` Prepended to each message
 *
 * Properties:
 *
 * - `{object} adapter` Ex. `require('./lib/adapter/commander')`
 * - `{object} console` `LongCon` instance
 * - `{object} options` CLI options extracted by adapter
 * - `{object} provider` commander.js, optimist, etc.
 *
 * @see LongCon https://github.com/codeactual/long-con/blob/master/docs/LongCon.md
 */
function ImpulseBin() {
  this.settings = {
    adapter: 'commander',
    quietOption: 'quiet',
    requiredOptionTmpl: '--%s is required',
    verboseOption: 'verbose',
    verboseLogName: '[verbose]',
    stdoutLogName: '[stdout]',
    stderrLogName: '[stderr]'
  };

  this.console = require('long-con').create();

  // Assigned in run():
  this.adapter = null;
  this.options = null;
  this.provider = null;
}

configurable(ImpulseBin.prototype);

/**
 * Wrap adapter require() for stubbing.
 *
 * @param {string} name Ex. 'commander'
 * @return {object}
 * @api private
 */
ImpulseBin.prototype.loadAdapter = function(name) {
  return require('../adapter/' + this.get('adapter'));
};

/**
 * Run the handler function with a prepared context.
 *
 * Examples:
 *
 *     bin.run(commander, require('./path/to/handler/module'));
 *     bin.run(optimist, require('./path/to/handler/module'));
 *
 * `handler` module must export:
 *
 * - `{function} init` Set option/arg expectations
 *   - Receives one argument: `provider` object
 * - `{function} run` Respond to parsed options/args
 *   - Receives no arguments
 *
 * @param {object} provider Ex. commander.js or optimist module
 * @param {object} handler
 * @param {mixed} [args]* Remaining args are passed to handler module's `run`.
 */
ImpulseBin.prototype.run = function(provider, handler) {
  var self = this;

  this.provider = provider;
  this.adapter = this.loadAdapter();

  handler.init.call(null, this.provider);

  this.options = this.adapter.options(provider);

  // Used internally and available by handler for optional use.
  this.stderr = this.console.create(this.get('stderrLogName'), console.error, 'red');
  this.stdout = this.console.create(this.get('stdoutLogName'), console.log);
  this.verbose = this.createVerbose(console.log);

  this.console.set('quiet', this.options[this.get('quietOption')]);

  var context = {
    provider: provider,

    args: this.adapter.args(provider),
    options: this.options,

    child_process: require('child_process'),
    console: this.console,
    clc: require('cli-color'),
    fs: require('fs'),
    shelljs: require('outer-shelljs').create(),
    util: util,

    createVerbose: this.createVerbose.bind(this),
    stderr: this.stderr,
    stdout: this.stdout,
    verbose: this.verbose.bind(this),

    exit: this.exit.bind(this),
    exitOnMissingOption: this.exitOnMissingOption.bind(this),
    exitOnShelljsErr: this.exitOnShelljsErr.bind(this)
  };

  handler.run.apply(context, [].slice.call(arguments, 2));
};

/**
 * Create a logger that respects `--verbose`, or the flag with a name
 * matching the `verboseOption` config value.
 *
 * Examples:
 *
 *     var log = bin.createVerbose();
 *     fn('key: %s', key);
 *     fn.push('method entered: %s', name);
 *     fn.pop('method exited: %s', name);
 *
 * @param {mixed} args* `LongCon#create` arguments
 * @return {function} `long-con` logger function
 * @see LongCon https://github.com/codeactual/long-con/blob/master/docs/LongCon.md
 */
ImpulseBin.prototype.createVerbose = function() {
  if (!this.options[this.get('verboseOption')]) { return impulseBinNoOp; }

  var args = [this.get('verboseLogName')].concat([].slice.call(arguments));
  return this.console.create.apply(this.console, args);
};

/**
 * Exit process.
 *
 * Examples:
 *
 *     bin.exit('bailing'); // status code = 1
 *     bin.exit('no more work', 0); // status code = 0
 *     bin.exit('no config file', 2); // status code = 2
 *
 * @param {string} msg Message sent to stderr
 * @param {number} [code=1] Status code
 */
ImpulseBin.prototype.exit = function(msg, code) {
  this.stderr(msg);
  process.exit(typeof code === 'undefined' ? 1 : code);
};

/**
 * Exit if the given CLI options are undefined.
 *
 * Examples:
 *
 *     bin.exitOnMissingOption('config', 2); // status code = 2
 *     bin.exitOnMissingOption(['config', 'file'], 3); // status code = 3
 *
 * @param {string|array} key
 * @param {number} exitCode
 */
ImpulseBin.prototype.exitOnMissingOption = function(key, exitCode) {
  var self = this;
  [].concat(key).forEach(function(key) {
    if (typeof self.options[key] === 'undefined') {
      if (self.adapter.help) {
        self.adapter.help(self.provider);
      }
      self.exit(sprintf(self.get('requiredOptionTmpl'), key), exitCode);
    }
  });
};

/**
 * Exit if the ShellJS exec() result object indicates an error.
 *
 * - `output` string will be sent to stderr.
 *
 * Example:
 *
 *     var res = bin.shelljs._('exec', ...);
 *     bin.exitOnShelljsErr(res);
 *
 * @param {object} res Result object w/ standard `code` and `output`.
 */
ImpulseBin.prototype.exitOnShelljsErr = function(res) {
  if (res.code !== 0) { this.exit(res.output, res.code); }
};

function defClrFn(str) { return str; }

function impulseBinNoOp() {}
