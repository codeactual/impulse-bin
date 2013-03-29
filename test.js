var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var ci = require('./dist/cmdr-input');
var CmdrInput = ci.CmdrInput;
var requireComponent = ci.require;

requireComponent('sinon-doublist')(sinon, 'mocha');

describe('ci', function() {
  describe('CmdrInput', function() {
    beforeEach(function() {
      this.input = {};

      this.ci = new CmdrInput();
      this.ci
        .set('input', this.input)
        .set('nativeRequire', require);
    });

    it('should do something', function() {
      console.log('\x1B[33m<---------- INCOMPLETE');
    });
  });
});
