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
  this.options = {}; // Ex, commander options object from adapter
  this.provider = null; // Ex. commander module after parse()
  this.sprintf = null; // util format()
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

  this.adapter = require('./lib/adapter/' + this.get('adapter'));
  this.options = this.adapter.options(provider);
  this.provider = provider;
  this.sprintf = this.get('nativeRequire')('util').format;

  var context = {
    fs: nativeRequire('fs'),
    options: this.options,
    args: this.adapter.args(provider),
    provider: provider,
    shelljs: require('outer-shelljs').create(),
    util: nativeRequire('util')
  };
  extend(context, helpers);
  module.cli.call(context);
};

var helpers = {};

/**
 * util.format() wrapper with timestamp and injected output function.
 * Respects --quiet.
 *
 * @param {function} fn Ex. console.log
 * @param {mixed} args* For util.format()
 */
helpers.console = function(fn) {
  if (this.get('input')[this.get('quietOption')]) { return; }
  var sprintf = this.get('nativeRequire')('util').format;
  fn(sprintf(
    '[%s] %s',
    (new Date()).toUTCString(), sprintf.apply(null, [].slice.call(arguments, 1))
  ));
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
  var sprintf = this.get('nativeRequire')('util').format;
  [].concat(key).forEach(function(key) {
    if (typeof self.options[key] === 'undefined') {
      self.exit(sprintf(self.get('requiredOptionTmpl'), key), exitCode);
    }
  });
};

/**
 * util.format() wrapper with timestamp and console.error.
 */
helpers.stderr = function() { this.console.apply(this, console.error, arguments); };

/**
 * util.format() wrapper with timestamp and console.log.
 */
helpers.stdout = function() { this.console.apply(this, console.log, arguments); };

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
