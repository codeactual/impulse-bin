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
  require: require, // Allow tests to use component-land require.
  mixinCliMod: mixinCliMod,
  mixinHelpers: mixinHelpers
};

var configurable = require('configurable.js');

function create() {
  return new CliMod();
}

function CliMod() {
  this.settings = {
    adapter: 'commander',
    nativeRequire: {},
    quietOption: 'quiet',
    requiredOptionTmpl: '--%s is required',
    verboseOption: 'verbose'
  };

  // Assigned in run():
  this.adapter = null; // Ex. require('./lib/adapter/commander.js')
  this.clc = null; // cli-color module
  this.options = {}; // Ex, commander options object from adapter
  this.provider = null; // Ex. commander module after parse()
  this.sprintf = null; // util.format()
  this.stderr = null; // Logger by createConsole()
  this.stdout = null; // Logger by createConsole()
  this.verbose = null; // Logger by createConsole()
}

configurable(CliMod.prototype);

CliMod.prototype.options = function() {
  return this.adapter.options(this.get('provider'));
};

/**
 * Run the module's 'cli' function with a prepared context.
 *
 * @param {object} module
 */
CliMod.prototype.run = function(provider, module) {
  var extend = require('extend');
  var nativeRequire = this.get('nativeRequire');
  var util = this.get('nativeRequire')('util');

  this.adapter = require('./lib/adapter/' + this.get('adapter'));
  this.clc = nativeRequire('cli-color');
  this.options = this.adapter.options(provider);
  this.provider = provider;
  this.sprintf = util.format;
  this.stderr = this.createConsole('stderr', console.error, this.clc.red);
  this.stdout = this.createConsole('stdout', console.log);
  this.verbose = this.createConsole('verbose', util.debug);

  var context = {
    args: this.adapter.args(provider),
    clc: this.clc,
    fs: nativeRequire('fs'),
    options: this.options,
    provider: provider,
    shelljs: require('outer-shelljs').create(),
    util: util
  };
  extend(context, helpers);
  module.cli.call(context);
};

var helpers = {};

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
helpers.console = function(name, fn, colorFn, colorBody) {
  if (this.get('input')[this.get('quietOption')]) { return; }
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
 * Create a helper.console() wrapper.
 *
 * @param {string} name Source logger's name, ex. 'stderr'
 * @param {function} fn Ex. console.log
 * @param {function} colorFn cli-color colorizer
 * @param {boolean} colorBody Apply colorFn to log body in addition to name
 * @return {function} Accepts util.format() arguments
 */
helpers.createConsole = function(name, fn, colorFn, colorBody) {
  var self = this;
  return function() {
    self.console.apply(self, name, fn, colorFn, colorBody, arguments);
  };
};

helpers.exit = function(msg, code) {
  this.stderr(msg);
  process.exit(typeof code === 'undefined' ? 1 : code);
};

/**
 * Exit if the given CLI options are undefined.
 *
 * @param {string|array} key
 * @param {number} exitCode
 */
helpers.exitOnMissingOption = function(key, exitCode) {
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
helpers.verbose = function() {
  if (!this.get('input')[this.get('verboseOption')]) { return; }
  this.console.apply(this, this.get('nativeRequire')('util').debug, arguments);
};

helpers.require = {};

helpers.require.Node = function(id) {
  return this.get('nativeRequire')(id);
};

helpers.require.component = function(id) {
  return require(id);
};

helpers.shelljs = {};

helpers.shelljs.exitOnError = function(res) {
  if (res.code !== 0) { this.exit(res.output, res.code); }
};

/**
 * Mix the given function set into CliMod's prototype.
 *
 * @param {object} ext
 */
function mixinCliMod(ext) { require('extend')(CliMod.prototype, ext); }

/**
 * Mix the given function set into the helpers object.
 *
 * @param {object} ext
 */
function mixinHelpers(ext) { require('extend')(helpers, ext); }

function defClrFn(str) { return str; }
