/*eslint func-names: 0, new-cap: 0, no-unused-expressions: 0, no-wrap-func: 0*/
'use strict';

const sinon = require('sinon');
const chai = require('chai');

chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

require('sinon-doublist')(sinon, 'mocha');

describe('adapter for', function() {
  beforeEach(function() {
    process.argv = [
      'node',
      '/path/to/script',
      '--foo',
      '1',
      '--bar',
      '2',
      'baz',
      'bat'
    ];
    this.options = {foo: 1, bar: 2};
    this.args = ['baz', 'bat'];
  });

  describe('commander.js', function() {
    beforeEach(function() {
      const commander = require('commander');
      commander.option('--foo <#>', '', Number).option('--bar <#>', '', Number);
      this.provider = commander;
      this.adapter = require('../../lib/adapter/commander');
    });

    it('should extract args', function() {
      this.adapter.args(this.provider).should.deep.equal(this.args);
    });

    it('should show help', function() {
      const stub = this.stub(this.provider, 'outputHelp');
      this.adapter.help(this.provider);
      stub.should.have.been.called;
    });

    it('should extract options', function() {
      const actual = this.adapter.options(this.provider);
      actual.foo.should.equal(this.options.foo);
      actual.bar.should.equal(this.options.bar);
    });
  });

  describe('optimist', function() {
    beforeEach(function() {
      this.provider = require('optimist');
      this.adapter = require('../../lib/adapter/optimist');
    });

    it('should extract args', function() {
      this.adapter.args(this.provider).should.deep.equal(this.args);
    });

    it('should show help', function() {
      const stub = this.stub(this.provider, 'showHelp');
      this.adapter.help(this.provider);
      stub.should.have.been.called;
    });

    it('should extract options', function() {
      const actual = this.adapter.options(this.provider);
      actual.foo.should.equal(this.options.foo);
      actual.bar.should.equal(this.options.bar);
    });
  });
});
