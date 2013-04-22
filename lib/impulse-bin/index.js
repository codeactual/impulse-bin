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

  // Assigned in run():
  this.adapter = null; // Ex. require('./lib/adapter/commander.js')
  this.options = {}; // Ex, commander options object from adapter
  this.provider = null; // Ex. commander module after parse()

  this.console = require('long-con').create();
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
 * Run the module (function) with a prepared context.
 *
 * @param {object} provider Ex. commander.js parse() output
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

ImpulseBin.prototype.createVerbose = function(name) {
  if (!this.options[this.get('verboseOption')]) { return impulseBinNoOp; }
  return this.console.create(this.get('verboseLogName'), console.log);
};

ImpulseBin.prototype.exit = function(msg, code) {
  this.stderr(msg);
  process.exit(typeof code === 'undefined' ? 1 : code);
};

/**
 * Exit if the given CLI options are undefined.
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

ImpulseBin.prototype.exitOnShelljsErr = function(res) {
  if (res.code !== 0) { this.exit(res.output, res.code); }
};

function defClrFn(str) { return str; }

function impulseBinNoOp() {}
