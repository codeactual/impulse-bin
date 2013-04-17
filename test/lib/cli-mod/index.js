var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var cliMod = require('../../..');

require('sinon-doublist')(sinon, 'mocha');

describe('cli-mod', function() {
  describe('CliMod', function() {
    beforeEach(function() {
      this.input = {};
      this.ci = cliMod.create();
    });

    it('should do something', function() {
      console.log('\x1B[33m<---------- INCOMPLETE');
    });
  });
});
