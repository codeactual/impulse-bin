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
 * Usage:
 *
 *     var bin = require('impulse-bin').create(); // new ImpulseBin() instance
 *
 * Example configuration:
 *
 *     bin
 *       .set('adapter', 'optimist')
 *       .set('quietOption', 'silent');
 *
 *  Configuration:
 *
 *  - `{string} [adapter='commander]` Valid name of adapter in `./lib/adapter/`
 *  - `{string} [quietOption='quiet']` Silence all loggers on `--quiet`
 *  - `{string} [requiredOptionTmpl='--%s is required']` `exitOnMissingOption()` message template
 *  - `{string} [verboseOption='verbose']` Enable verbose logger on `--verbose`
 *  - `{string} [verboseLogName='[verbose]']` Prepended to each message
 *  - `{string} [stdoutLogName='[stdout]']` Prepended to each message
 *  - `{string} [stderrLogName='[stderr]']` Prepended to each message
 *
 *  Properties:
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
 * @param {function} handler Handles CLI options/args from provider
 */
ImpulseBin.prototype.run = function(provider, handler) {
  var self = this;
  var bind = requireComponent('bind');
  var each = requireComponent('each');
  var extend = requireComponent('extend');

  this.adapter = this.loadAdapter();
  this.options = this.adapter.options(provider);
  this.provider = provider;

  // Used internally and available by handler for optional use.
  this.stderr = this.console.create(this.get('stderrLogName'), console.error, 'red');
  this.stdout = this.console.create(this.get('stdoutLogName'), console.log);
  this.verbose = this.createVerbose();

  this.console.set('quiet', this.options[this.get('quietOption')]);

  var context = {
    args: this.adapter.args(provider),
    child_process: require('child_process'),
    clc: require('cli-color'),
    fs: require('fs'),
    options: this.options,
    provider: provider,
    shelljs: require('outer-shelljs').create(),
    util: util,

    createVerbose: bind(this, this.createVerbose),
    exit: bind(this, this.exit),
    exitOnMissingOption: bind(this, this.exitOnMissingOption),
    exitOnShelljsErr: bind(this, this.exitOnShelljsErr),

    stderr: this.stderr,
    stdout: this.stdout,
    verbose: bind(this, this.verbose)
  };
  handler.call(context);
};

/**
 * Create a verbose logger.
 *
 * Examples:
 *
 *     var log = bin.createVerbose();
 *     fn('key: %s', key);
 *     fn.push('method entered: %s', name);
 *     fn.pop('method exited: %s', name);
 *
 * @return {function} long-con logger function.
 */
ImpulseBin.prototype.createVerbose = function() {
  if (!this.options[this.get('verboseOption')]) { return impulseBinNoOp; }
  return this.console.create(this.get('verboseLogName'), console.log);
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
