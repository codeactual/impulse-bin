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
    done: noOp
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

helpers.requireNode = function(id) {
  return this.get('nativeRequire')(id);
};

helpers.requireComponent = function(id) {
  return require(id);
};

helpers.exit = function(msg, code) {
  this.get('nativeRequire')('util').error(msg);
  process.exit(typeof code === 'undefined' ? 1 : code);
};

helpers.exitOnShelljsError = function(res) {
  if (res.code !== 0) { this.exit(res.output, res.code); }
};

helpers.exitOnMissingOption = function(input, options, code) {
  var self = this;
  options.forEach(function(param) {
    if (!input[param]) { self.exit('--' + param + ' required', code); }
  });
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
