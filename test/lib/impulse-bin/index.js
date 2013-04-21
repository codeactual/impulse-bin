var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var impulseBin = require('../../..');

require('sinon-doublist')(sinon, 'mocha');

describe('ImpulseBin', function() {
  beforeEach(function() {
    this.ib = impulseBin.create();
  });

  describe('#run', function() {
    it.skip('should store ref to adapter', function() {
    });

    it.skip('should store ref to provider', function() {
    });

    it.skip('should extract options with adapter', function() {
    });

    it.skip('should extract args with adapter', function() {
    });

    it.skip('should optionally silence loggers', function() {
    });

    it.skip('should init stdout logger', function() {
    });

    it.skip('should init stderr logger', function() {
    });

    it.skip('should init verbose logger', function() {
    });

    describe('injected context', function() {
      it.skip('should include extracted args', function() {
      });

      it.skip('should include child_process', function() {
      });

      it.skip('should include cli-color', function() {
      });

      it.skip('should include fs', function() {
      });

      it.skip('should include extracted options', function() {
      });

      it.skip('should include provider', function() {
      });

      it.skip('should include OuterShelljs', function() {
      });

      it.skip('should include util', function() {
      });

      it.skip('should include #createVerbose mixin', function() {
      });

      it.skip('should include #exit mixin', function() {
      });

      it.skip('should include #exitOnMissingOption mixin', function() {
      });

      it.skip('should include #exitOnShelljsErr mixin', function() {
      });
    });
  });

  describe('#createVerbose', function() {
    it.skip('should use default logger name', function() {
    });

    it.skip('should use optional logger name', function() {
    });

    it.skip('should return no-op by default', function() {
    });

    it.skip('should optionally return logger', function() {
    });
  });

  describe('#exit', function() {
    it.skip('should output message to stderr', function() {
    });

    it.skip('should exit process with default code', function() {
    });

    it.skip('should exit process with optional code', function() {
    });
  });

  describe('#exitOnMissingOption', function() {
    it.skip('should use #exit', function() {
    });
  });

  describe('#exitOnShelljsErr', function() {
    it.skip('should do nothing on zero code', function() {
    });

    it.skip('should use #exit on non-zero code', function() {
    });
  });
});
