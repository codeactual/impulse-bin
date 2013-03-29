/**
 * commander.js input handling class
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

module.exports = {
  CmdrInput: CmdrInput,
  require: require // Allow tests to use component-land require.
};

var configurable = require('configurable.js');

function CmdrInput() {
  this.settings = {
    input: {},
    nativeRequire: {}
  };
}

configurable(CmdrInput.prototype);

CmdrInput.prototype.run = function(cb) {
  var rsvp = this.get('nativeRequire')('rsvp');
  var promise = new rsvp.Promise();
  cb.call(this, promise);
  return promise;
};

CmdrInput.prototype.exit = function(msg, code) {
  this.get('nativeRequire')('util').error(msg);
  process.exit(typeof code === 'undefined' ? 1 : code);
};

CmdrInput.prototype.exitOnShellError = function(res) {
  if (res.code !== 0) { this.exit(res.output, res.code); }
};

CmdrInput.prototype.exitOnMissingParam = function(params) {
  var self = this;
  params.forEach(function(param) {
    if (!self.get('input')[param]) { self.exit('--' + param + ' required'); }
  });
};
