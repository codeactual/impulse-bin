/**
 * Modules for commander.js
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

module.exports = {
  create: create,
  CliMod: CliMod,
  requireComponent: require,
  mixinCliMod: mixinCliMod,
  requireNative: null
};

var configurable = require('configurable.js');

function create() {
  return new CliMod();
}

function CliMod() {
  this.settings = {
    adapter: 'commander',
    quietOption: 'quiet',
    requiredOptionTmpl: '--%s is required',
    verboseOption: 'verbose'
  };

  var util = this.requireNative('util');

  // Assigned in run():
  this.adapter = null; // Ex. require('./lib/adapter/commander.js')
  this.clc = this.requireNative('cli-color');
  this.options = {}; // Ex, commander options object from adapter
  this.provider = null; // Ex. commander module after parse()
  this.sprintf = util.format;

  this.stderr = this.createConsole('stderr', console.error, this.clc.red);
  this.stdout = this.createConsole('stdout', console.log);
  this.verbose = this.createConsole('verbose', util.debug);
}

configurable(CliMod.prototype);

/**
 * Run the module (function) with a prepared context.
 *
 * @param {object} fn
 */
CliMod.prototype.run = function(provider, fn) {
  var self = this;
  var bind = require('bind');
  var each = require('each');
  var extend = require('extend');
  var requireNative = module.exports.requireNative;
  var util = requireNative('util');

  this.adapter = require('./adapter/' + this.get('adapter'));
  this.options = this.adapter.options(provider);
  this.provider = provider;

  var context = {
    args: this.adapter.args(provider),
    child_process: requireNative('child_process'),
    clc: this.clc,
    fs: requireNative('fs'),
    options: this.options,
    provider: provider,
    shelljs: require('outer-shelljs').create(requireNative('shelljs')),
    util: util
  };
  fn.call(extend(context, this));
};

/**
 * util.format() wrapper with timestamp and injected output function.
 * Respects --quiet.
 *
 * @param {string} name Source logger's name, ex. 'stderr'
 * @param {function} fn Ex. console.log
 * @param {function} colorFn cli-color colorizer
 * @param {boolean} colorBody Apply colorFn to log body in addition to name
 * @param {mixed} args* For util.format()
 */
CliMod.prototype.console = function(name, fn, colorFn, colorBody) {
  if (this.options[this.get('quietOption')]) { return; }
  colorFn = colorFn || defClrFn;
  var bodyColorFn = colorBody ? colorFn : defClrFn;
  fn(this.sprintf(
    '[%s] %s%s',
    (new Date()).toUTCString(),
    name ? colorFn(name + ' ') : '',
    bodyColorFn(this.sprintf.apply(null, [].slice.call(arguments, 4)))
  ));
};

/**
 * Create a console() wrapper.
 *
 * @param {string} name Source logger's name, ex. 'stderr'
 * @param {function} fn Ex. console.log
 * @param {function} colorFn cli-color colorizer
 * @param {boolean} colorBody Apply colorFn to log body in addition to name
 * @return {function} Accepts util.format() arguments
 */
CliMod.prototype.createConsole = function(name, fn, colorFn, colorBody) {
  var self = this;
  return function() {
    self.console.apply(self, [name, fn, colorFn, colorBody].concat([].slice.call(arguments)));
  };
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
      self.exit(self.sprintf(self.get('requiredOptionTmpl'), key), exitCode);
    }
  });
};

/**
 * util.debug() wrapper that checks --verbose before continuing.
 * Use debug() to block.
 */
CliMod.prototype.verbose = function() {
  if (!this.options[this.get('verboseOption')]) { return; }
  this.console.apply(this, this.requireNative('util').debug, arguments);
};

CliMod.prototype.requireNative = function(id) {
  return module.exports.requireNative(id);
};

CliMod.prototype.exitOnShelljsErr = function(res) {
  if (res.code !== 0) { this.exit(res.output, res.code); }
};

/**
 * Mix the given function set into CliMod's prototype.
 *
 * @param {object} ext
 */
function mixinCliMod(ext) { require('extend')(CliMod.prototype, ext); }

function defClrFn(str) { return str; }
