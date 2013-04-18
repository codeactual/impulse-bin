/**
 * Modules for commander.js and others
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

module.exports = {
  CliMod: CliMod,
  create: function() { return new CliMod(); },
  mixin: function(ext) { extend(CliMod.prototype, ext); }
};

var util = require('util');
var sprintf = util.format;

var requireComponent = require('../component/require');
var configurable = requireComponent('configurable.js');
var extend = requireComponent('extend');

function CliMod() {
  this.settings = {
    adapter: 'commander',
    quietOption: 'quiet',
    requiredOptionTmpl: '--%s is required',
    verboseOption: 'verbose'
  };

  // Assigned in run():
  this.adapter = null; // Ex. require('./lib/adapter/commander.js')
  this.options = {}; // Ex, commander options object from adapter
  this.provider = null; // Ex. commander module after parse()

  this.console = require('codeactual-node-console').create();
  this.stderr = this.console.create('[stderr]', console.error, 'red');
  this.stdout = this.console.create('[stdout]', console.log);
  this.verbose = this.createVerbose();
}

configurable(CliMod.prototype);

/**
 * Run the module (function) with a prepared context.
 *
 * @param {object} fn
 */
CliMod.prototype.run = function(provider, fn) {
  var self = this;
  var bind = requireComponent('bind');
  var each = requireComponent('each');
  var extend = requireComponent('extend');

  this.adapter = require('../adapter/' + this.get('adapter'));
  this.options = this.adapter.options(provider);
  this.provider = provider;

  this.console.set('quiet', this.options[this.get('quietOption')]);

  var context = {
    args: this.adapter.args(provider),
    child_process: require('child_process'),
    clc: this.clc,
    fs: require('fs'),
    options: this.options,
    provider: provider,
    shelljs: require('outer-shelljs').create(),
    util: util
  };
  fn.call(extend(context, this));
};

CliMod.prototype.createVerbose = function(name) {
  if (!this.options[this.get('verboseOption')]) { return noOp; }
  name = name || '[verbose]';
  return this.console.create(name, console.log);
};

CliMod.prototype.exit = function(msg, code) {
  this.stderr(msg);
  process.exit(typeof code === 'undefined' ? 1 : code);
};

/**
 * Exit if the given CLI options are undefined.
 *
 * @param {string|array} key
 * @param {number} exitCode
 */
CliMod.prototype.exitOnMissingOption = function(key, exitCode) {
  var self = this;
  [].concat(key).forEach(function(key) {
    if (typeof self.options[key] === 'undefined') {
      self.exit(sprintf(self.get('requiredOptionTmpl'), key), exitCode);
    }
  });
};

CliMod.prototype.exitOnShelljsErr = function(res) {
  if (res.code !== 0) { this.exit(res.output, res.code); }
};

function defClrFn(str) { return str; }

function noOp() {}
