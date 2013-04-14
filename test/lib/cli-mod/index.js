var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var ci = require('../../../dist/cli-mod');
ci.requireNative = require;

var CliMod = ci.CliMod;
var requireComponent = ci.requireComponent;

requireComponent('sinon-doublist')(sinon, 'mocha');

describe('ci', function() {
  describe('CliMod', function() {
    beforeEach(function() {
      this.input = {};

      this.ci = new CliMod();
    });

    it('should do something', function() {
      console.log('\x1B[33m<---------- INCOMPLETE');
    });
  });
});
