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

    this.options = {fakeKey: 'fakeVal'};
    this.args = ['fakeArg'];
    this.adapter = this.stubMany({}, ['options', 'args']);
    this.adapter.args.returns(this.args);
    this.adapter.options.returns(this.options);
    this.loadAdapterStub = this.stub(this.ib, 'loadAdapter');
    this.loadAdapterStub.returns(this.adapter);

    this.provider = require('commander');
    this.handler = this.spy();
  });

  describe('#run', function() {
    beforeEach(function() {
      this.ib.run(this.provider, this.handler);
    });

    it('should store ref to adapter', function() {
      this.ib.adapter.should.deep.equal(this.adapter);
    });

    it('should store ref to provider', function() {
      this.ib.provider.should.deep.equal(this.provider);
    });

    it('should extract options with adapter', function() {
      this.ib.options.should.deep.equal(this.options);
    });

    it('should extract args with adapter', function() {
      this.handler.thisValues[0].args.should.deep.equal(this.args);
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
