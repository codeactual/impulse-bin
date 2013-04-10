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
  CmdrInput: CmdrInput,
  require: require, // Allow tests to use component-land require.
  mixinCmdrInput: mixinCmdrInput,
  mixinHelpers: mixinHelpers
};

var configurable = require('configurable.js');

function create() {
  return new CmdrInput();
}

function CmdrInput() {
  this.settings = {
    nativeRequire: {},
    done: noOp,
    quietOption: 'quiet',
    verboseOption: 'verbose',
    input: {}, // commander.js module,
    requiredOptionTmpl: '--%s is required'
  };
}

configurable(CmdrInput.prototype);

/**
 * Add a step to the CLI run.
 *
 * Each step typically defined as a module whose export is a function.
 * The function accepts a single argument, defined in run(), and is responsible
 * for resolving an injected promise.
 *
 * @param {function} cb
 */
CmdrInput.prototype.push = function(cb) {
  this.steps.push(cb);
};

CmdrInput.prototype.run = function(commander) {
  var extend = require('extend');
  var nativeRequire = this.get('nativeRequire');
  var rsvp = nativeRequire('rsvp');
  var promises = [];
  this.steps.forEach(function(cb) {
    var promise = rsvp.promise();
    var context = {
      fs: nativeRequire('fs'),
      input: this.input,
      promise: promise,
      rsvp: rsvp,
      shelljs: require('outer-shelljs').create(),
      util: nativeRequire('util')
    };
    extend(context, helpers);
    promises.push(promises);
    cb.call(context);
  });
  rsvp.all(promises).then(this.get('done'));
};

var helpers = {};

/**
 * util.debug() wrapper that checks --verbose before continuing.
 * Use debug() to block.
 */
helpers.verbose = function() {
  if (!this.get('input')[this.get('verboseOption')]) { return; }
  this.console.apply(this, this.get('nativeRequire')('util').debug, arguments);
};

/**
 * util.format() wrapper with timestamp and console.log.
 */
helpers.stdout = function() { this.console.apply(this, console.log, arguments); };

/**
 * util.format() wrapper with timestamp and console.error.
 */
helpers.stderr = function() { this.console.apply(this, console.error, arguments); };

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

helpers.exitOnMissingOption = function(input, code) {
  var self = this;
  var each = require('each');
  var sprintf = this.get('nativeRequire')('util').format;
  each(this.get('input'), function(param) {
    if (!input[param]) {
      self.exit(sprintf(this.get('requiredOptionTmpl'), param), code);
    }
  });
};

helpers.require = {};

helpers.require.Node = function(id) {
  return this.get('nativeRequire')(id);
};

helpers.require.component = function(id) {
  return require(id);
};

helpers.shelljs = {};

helpers.shell.exitOnError = function(res) {
  if (res.code !== 0) { this.exit(res.output, res.code); }
};

/**
 * Mix the given function set into CmdrInput's prototype.
 *
 * @param {object} ext
 */
function mixinCmdrInput(ext) { require('extend')(CmdrInput.prototype, ext); }

/**
 * Mix the given function set into the helpers object.
 *
 * @param {object} ext
 */
function mixinHelpers(ext) { require('extend')(helpers, ext); }

function noOp() {}
