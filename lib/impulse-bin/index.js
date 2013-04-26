/**
 * Modules for commander.js and others
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

module.exports = {
  ImpulseBin: ImpulseBin,
  create: function() { return new ImpulseBin(); },
  extend: function(ext) { extend(ImpulseBin.prototype, ext); }
};

var util = require('util');
var sprintf = util.format;

var requireComponent = require('../component/require');
var configurable = requireComponent('configurable.js');
var extend = requireComponent('extend');

/**
 * ImpulseBin constructor.
 *
 *     var bin = require('impulse-bin').create(); // new ImpulseBin() instance
 *
 * Example configuration:
 *
 *     bin
 *       .set('adapter', 'optimist')
 *       .set('quietOption', 'silent');
 *
 * Configuration:
 *
 *  - `{string} [adapter='commander]` Valid name of adapter in `./lib/adapter/`
 *  - `{string} [quietOption='quiet']` Silence all loggers on `--quiet`
 *  - `{string} [requiredOptionTmpl='--%s is required']` `exitOnMissingOption()` message template
 *  - `{string} [verboseOption='verbose']` Enable verbose logger on `--verbose`
 *  - `{string} [verboseLogName='[verbose]']` Prepended to each message
 *  - `{string} [stdoutLogName='[stdout]']` Prepended to each message
 *  - `{string} [stderrLogName='[stderr]']` Prepended to each message
 *
 * Properties:
 *
 *  - `{object} adapter` Ex. `require('./lib/adapter/commander')`
 *  - `{object} console` long-con instance
 *  - `{object} options` CLI options extracted by adapter
 *  - `{object} provider` commander.js, optimist, etc.
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
 * @param {object} provider Ex. commander.js or optimist module
 * @param {object} handler Module that exports:
 *   {function} init Set option/arg expectations
 *     Receives one argument: provider object.
 *   {function} run Respond to parsed options/args
 *     Receives no arguments.
 */
ImpulseBin.prototype.run = function(provider, handler) {
  var self = this;
  var bind = requireComponent('bind');
  var each = requireComponent('each');
  var extend = requireComponent('extend');

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

    createVerbose: bind(this, this.createVerbose),
    stderr: this.stderr,
    stdout: this.stdout,
    verbose: bind(this, this.verbose),

    exit: bind(this, this.exit),
    exitOnMissingOption: bind(this, this.exitOnMissingOption),
    exitOnShelljsErr: bind(this, this.exitOnShelljsErr)
  };

  handler.run.call(context);
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
 * @see https://github.com/codeactual/long-con/docs/API.md
 * @param {mixed} args* LongCon#create arguments
 * @return {function} long-con logger function
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
