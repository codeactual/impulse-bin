/*jshint expr:true*/
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

    this.createConsoleStub = this.stub(this.ib.console, 'create');
    this.createVerboseStub = this.stub(this.ib, 'createVerbose');
    this.exitStub = this.stub(this.ib, 'exit');
    this.exitOnMissingOptionStub = this.stub(this.ib, 'exitOnMissingOption');
    this.exitOnShelljsErrStub = this.stub(this.ib, 'exitOnShelljsErr');

    this.verboseLogger = function() {};
    this.createVerboseStub.returns(this.verboseLogger);

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

    it('should store ref to extracted options', function() {
      this.ib.options.should.deep.equal(this.options);
    });

    it('should store ref to provider', function() {
      this.ib.provider.should.deep.equal(this.provider);
    });

    it('should not silence loggers by default', function() {
      should.not.exist(this.ib.console.get('quiet'));
    });

    it('should optionally silence loggers', function() {
      this.options.stayQuiet = true;
      this.ib.set('quietOption', 'stayQuiet');
      this.ib.run(this.provider, this.handler);
      this.ib.console.get('quiet').should.equal(true);
    });

    it('should init stderr logger', function() {
      var logger = {iAmA: 'stderr logger'};
      this.createConsoleStub.withArgs('[stderr]').returns(logger);
      this.ib.run(this.provider, this.handler);
      this.ib.stderr.should.deep.equal(logger);
    });

    it('should init stdout logger', function() {
      var logger = {iAmA: 'stdout logger'};
      this.createConsoleStub.withArgs('[stdout]').returns(logger);
      this.ib.run(this.provider, this.handler);
      this.ib.stdout.should.deep.equal(logger);
    });

    it('should init verbose logger', function() {
      this.ib.run(this.provider, this.handler);
      this.ib.verbose.should.deep.equal(this.verboseLogger);
    });

    describe('injected context', function() {
      it('should include extracted args', function() {
        this.handler.thisValues[0].args.should.deep.equal(this.args);
      });

      it('should include child_process', function() {
        this.handler.thisValues[0].child_process.should.deep.equal(
          require('child_process')
        );
      });

      it('should include cli-color', function() {
        this.handler.thisValues[0].clc.should.deep.equal(
          require('cli-color')
        );
      });

      it('should include fs', function() {
        this.handler.thisValues[0].fs.should.deep.equal(require('fs'));
      });

      it('should include extracted options', function() {
        this.handler.thisValues[0].options.should.deep.equal(this.options);
      });

      it('should include provider', function() {
        this.ib.options.should.deep.equal(this.options);
      });

      it('should include OuterShelljs', function() {
        var OuterShelljs = require('outer-shelljs').OuterShelljs;
        this.handler.thisValues[0].shelljs.should.be.an.instanceOf(OuterShelljs);
      });

      it('should include util', function() {
        this.handler.thisValues[0].util.should.deep.equal(require('util'));
      });

      it('should include #createVerbose mixin', function() {
        this.createVerboseStub.should.have.been.calledOnce;
        this.handler.thisValues[0].createVerbose();
        this.createVerboseStub.should.have.been.calledTwice;
      });

      it('should include #exit mixin', function() {
        this.handler.thisValues[0].exit('err', 2);
        this.exitStub.should.have.been.calledWithExactly('err', 2);
        this.exitStub.should.have.been.calledOn(this.ib);
      });

      it('should include #exitOnMissingOption mixin', function() {
        this.handler.thisValues[0].exitOnMissingOption('config', 5);
        this.exitOnMissingOptionStub.should.have.been.calledWithExactly('config', 5);
        this.exitOnMissingOptionStub.should.have.been.calledOn(this.ib);
      });

      it('should include #exitOnShelljsErr mixin', function() {
        var res = {iAma: 'shelljs result'};
        this.handler.thisValues[0].exitOnShelljsErr(res);
        this.exitOnShelljsErrStub.should.have.been.calledWithExactly(res);
        this.exitOnShelljsErrStub.should.have.been.calledOn(this.ib);
      });
    });
  });

  describe('#createVerbose', function() {
    beforeEach(function() {
      this.ib.createVerbose.restore();
      this.ib.run(this.provider, this.handler);
      this.name = 'verbose';
    });

    it('should return no-op by default', function() {
      this.ib.createVerbose(this.name).should.be.a('function');
      this.createConsoleStub.callCount.should.equal(2); // Only stdout/stderr in run()
    });

    it('should optionally return logger', function() {
      this.options.verbose = true;
      this.createConsoleStub.returns(this.verboseLogger);
      this.ib.createVerbose(this.name).should.deep.equal(this.verboseLogger);
    });

    it('should use optional logger name', function() {
      this.options.showVerbose = true;
      this.ib.set('verboseOption', 'showVerbose');
      this.createConsoleStub.returns(this.verboseLogger);
      this.ib.createVerbose(this.name).should.deep.equal(this.verboseLogger);
    });
  });

  describe('#exit', function() {
    beforeEach(function() {
      this.ib.exit.restore();
      this.createConsoleStub.returns(function() {});
      this.ib.run(this.provider, this.handler);
      this.procExitStub = this.stub(process, 'exit');
      this.msg = 'reason';
    });

    it('should output message to stderr', function() {
      var stub = this.stub(this.ib, 'stderr');
      this.ib.exit(this.msg);
      stub.should.have.been.calledWithExactly(this.msg);
    });

    it('should exit process with default code', function() {
      this.ib.exit(this.msg);
      this.procExitStub.should.have.been.calledWithExactly(1);
    });

    it('should exit process with optional code', function() {
      this.ib.exit(this.msg, 2);
      this.procExitStub.should.have.been.calledWithExactly(2);
    });
  });

  describe('#exitOnMissingOption', function() {
    beforeEach(function() {
      this.ib.exitOnMissingOption.restore();
      this.ib.run(this.provider, this.handler);
    });

    it('should use #exit', function() {
      this.ib.exitOnMissingOption('fakeKey', 2);
      this.exitStub.should.not.have.been.called;

      this.ib.exitOnMissingOption('notPresent', 2);
      this.exitStub.should.have.been.calledWithExactly('--notPresent is required', 2);
    });

    it('should use accept array', function() {
      this.ib.exitOnMissingOption(['fakeKey'], 2);
      this.exitStub.should.not.have.been.called;

      this.ib.exitOnMissingOption(['fakeKey', 'notPresent'], 2);
      this.exitStub.should.have.been.calledWithExactly('--notPresent is required', 2);
    });
  });

  describe('#exitOnShelljsErr', function() {
    beforeEach(function() {
      this.ib.exitOnShelljsErr.restore();
    });

    it('should do nothing on zero code', function() {
      this.ib.exitOnShelljsErr({code: 0});
      this.exitStub.should.not.have.been.called;
    });

    it('should use #exit on non-zero code', function() {
      this.ib.exitOnShelljsErr({code: 2, output: this.msg});
      this.exitStub.should.have.been.calledWithExactly(this.msg, 2);
    });
  });
});
