/*eslint func-names: 0, new-cap: 0, no-unused-expressions: 0, no-wrap-func: 0*/
'use strict';

const sinon = require('sinon');
const chai = require('chai');
const thunkify = require('thunkify');

const should = chai.should();
chai.config.includeStack = true;
chai.use(require('sinon-chai'));

const impulseBin = require('../../..');

require('co-mocha');

require('sinon-doublist')(sinon, 'mocha');

describe('ImpulseBin', function() {
  beforeEach(function() {
    const _this = this;

    this.bin = impulseBin.create();

    this.options = {fakeKey: 'fakeVal'};
    this.args = ['fakeArg'];
    this.adapter = this.stubMany({}, ['args', 'help', 'options']);
    this.adapter.args.returns(this.args);
    this.adapter.options.returns(this.options);
    this.loadAdapterStub = this.stub(this.bin, 'loadAdapter');
    this.loadAdapterStub.returns(this.adapter);

    this.createConsoleStub = this.stub(this.bin.console, 'create');
    this.createVerboseStub = this.stub(this.bin, 'createVerbose');
    this.exitStub = this.stub(this.bin, 'exit');
    this.exitOnMissingOptionStub = this.stub(this.bin, 'exitOnMissingOption');

    this.verboseLogger = function() {};
    this.createVerboseStub.withArgs(console.log).returns(this.verboseLogger); // eslint-disable-line no-console

    this.provider = require('commander');
    this.handler = {
      init: this.spy(),
      run: this.spy()
    };

    function callSpyCb(spy, done) {
      spy();
      done();
    }
    const callSpyThunk = thunkify(callSpyCb);
    this.handlerWithGenerator = {
      init: this.spy(),

      // Since sinon does not yet have generator support, we will still use a spy
      // to capture the context/args received by run().
      run: function *(a, b, c) {
        yield callSpyThunk(_this.handlerWithGenerator.spy.bind(this, a, b, c));
      },
      spy: this.spy()
    };
  });

  describe('#run', function() {
    beforeEach(function() {
      this.bin.run(this.provider, this.handler);
    });

    it('should store ref to adapter', function() {
      this.bin.adapter.should.deep.equal(this.adapter);
    });

    it('should run handler init', function() {
      this.handler.init.should.have.been.calledWithExactly(this.provider);
    });

    it('should store ref to extracted options', function() {
      this.bin.options.should.deep.equal(this.options);
    });

    it('should store ref to provider', function() {
      this.bin.provider.should.deep.equal(this.provider);
    });

    it('should not silence loggers by default', function() {
      should.not.exist(this.bin.console.get('quiet'));
    });

    it('should optionally silence loggers', function() {
      this.options.stayQuiet = true;
      this.bin.set('quietOption', 'stayQuiet');
      this.bin.run(this.provider, this.handler);
      this.bin.console.get('quiet').should.equal(true);
    });

    it('should init stderr logger', function() {
      const logger = {iAmA: 'stderr logger'};
      this.createConsoleStub.withArgs('[stderr]').returns(logger);
      this.bin.run(this.provider, this.handler);
      this.bin.stderr.should.deep.equal(logger);
    });

    it('should init stdout logger', function() {
      const logger = {iAmA: 'stdout logger'};
      this.createConsoleStub.withArgs('[stdout]').returns(logger);
      this.bin.run(this.provider, this.handler);
      this.bin.stdout.should.deep.equal(logger);
    });

    it('should init verbose logger', function() {
      this.bin.run(this.provider, this.handler);
      this.bin.verbose.should.deep.equal(this.verboseLogger);
    });

    describe('injected context', function() {
      it('should include extracted args', function() {
        this.handler.run.thisValues[0].args.should.deep.equal(this.args);
      });

      it('should include console', function() {
        this.handler.run.thisValues[0].console.should.deep.equal(this.bin.console);
      });

      it('should include cli-color', function() {
        this.handler.run.thisValues[0].clc.should.deep.equal(
          require('cli-color')
        );
      });

      it('should include extracted options', function() {
        this.handler.run.thisValues[0].options.should.deep.equal(this.options);
      });

      it('should include provider', function() {
        this.bin.options.should.deep.equal(this.options);
      });

      it('should include #createVerbose mixin', function() {
        this.createVerboseStub.should.have.been.calledOnce;
        this.handler.run.thisValues[0].createVerbose();
        this.createVerboseStub.should.have.been.calledTwice;
      });

      it('should include #exit mixin', function() {
        this.handler.run.thisValues[0].exit('err', 2);
        this.exitStub.should.have.been.calledWithExactly('err', 2);
        this.exitStub.should.have.been.calledOn(this.bin);
      });

      it('should include #exitOnMissingOption mixin', function() {
        this.handler.run.thisValues[0].exitOnMissingOption('config', 5);
        this.exitOnMissingOptionStub.should.have.been.calledWithExactly('config', 5);
        this.exitOnMissingOptionStub.should.have.been.calledOn(this.bin);
      });
    });
  });

  describe('#runGenerator', function() {
    it('should support GeneratorFunction handlers', function *() {
      yield this.bin.runGenerator(this.provider, this.handlerWithGenerator, 1, 2, 3);
      this.handlerWithGenerator.init.should.have.been.calledWithExactly(this.provider);
      this.handlerWithGenerator.spy.thisValues[0].args.should.deep.equal(this.args);
      this.handlerWithGenerator.spy.should.have.been.calledWithExactly(1, 2, 3);
    });
  });

  describe('#run extra args', function() {
    it('should be passed to handler module #run', function() {
      this.bin.run(this.provider, this.handler, 1, 2, 3);
      this.handler.run.should.have.been.calledWithExactly(1, 2, 3);
    });
  });

  describe('#createVerbose', function() {
    beforeEach(function() {
      this.bin.createVerbose.restore();
      this.bin.run(this.provider, this.handler);
      this.name = 'verbose';
    });

    it('should use LongCon#create', function() {
      this.options.verbose = true;
      this.bin.createVerbose(console.error, 'red'); // eslint-disable-line no-console
      this.createConsoleStub.should.have.been.calledWithExactly(
        '[verbose]', console.error, 'red' // eslint-disable-line no-console
      );
    });

    it('should return no-op by default', function() {
      this.bin.createVerbose().should.be.a('function');
      this.createConsoleStub.callCount.should.equal(2); // Only stdout/stderr in run()
    });

    it('should optionally return logger', function() {
      this.options.verbose = true;
      this.createConsoleStub.returns(this.verboseLogger);
      this.bin.createVerbose().should.deep.equal(this.verboseLogger);
    });

    it('should use optional logger name', function() {
      this.options.showVerbose = true;
      this.bin.set('verboseOption', 'showVerbose');
      this.createConsoleStub.returns(this.verboseLogger);
      this.bin.createVerbose().should.deep.equal(this.verboseLogger);
    });
  });

  describe('#exit', function() {
    beforeEach(function() {
      this.bin.exit.restore();
      this.createConsoleStub.returns(function() {});
      this.bin.run(this.provider, this.handler);
      this.procExitStub = this.stub(process, 'exit');
      this.msg = 'reason';
    });

    it('should output message to stderr', function() {
      const stub = this.stub(this.bin, 'stderr');
      this.bin.exit(this.msg);
      stub.should.have.been.calledWithExactly(this.msg);
    });

    it('should exit process with default code', function() {
      this.bin.exit(this.msg);
      this.procExitStub.should.have.been.calledWithExactly(1);
    });

    it('should exit process with optional code', function() {
      this.bin.exit(this.msg, 2);
      this.procExitStub.should.have.been.calledWithExactly(2);
    });
  });

  describe('#exitOnMissingOption', function() {
    beforeEach(function() {
      this.bin.exitOnMissingOption.restore();
      this.bin.run(this.provider, this.handler);
    });

    it('should show help content', function() {
      this.bin.exitOnMissingOption('notPresent');
      this.adapter.help.should.have.been.calledWithExactly(this.provider);
    });

    it('should use #exit', function() {
      this.bin.exitOnMissingOption('fakeKey', 2);
      this.exitStub.should.not.have.been.called;

      this.bin.exitOnMissingOption('notPresent', 2);
      this.exitStub.should.have.been.calledWithExactly('--notPresent is required', 2);
    });

    it('should use accept array', function() {
      this.bin.exitOnMissingOption(['fakeKey'], 2);
      this.exitStub.should.not.have.been.called;

      this.bin.exitOnMissingOption(['fakeKey', 'notPresent'], 2);
      this.exitStub.should.have.been.calledWithExactly('--notPresent is required', 2);
    });
  });
});
