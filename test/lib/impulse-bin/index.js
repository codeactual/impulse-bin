var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var impulseBin = require('../../..');

require('sinon-doublist')(sinon, 'mocha');

describe('impulse-bin', function() {
  describe('ImpulseBin', function() {
    beforeEach(function() {
      this.input = {};
      this.ci = impulseBin.create();
    });

    it('should do something', function() {
      console.log('\x1B[33m<---------- INCOMPLETE');
    });
  });
});
