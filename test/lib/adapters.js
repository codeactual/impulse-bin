/*jshint expr:true*/
var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
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
      var commander = require('commander');
      commander.option('--foo <#>', '', Number).option('--bar <#>', '', Number);
      this.provider = commander.parse(process.argv);
      this.adapter = require('../../lib/adapter/commander');
    });

    it('should extract args', function() {
      this.adapter.args(this.provider).should.deep.equal(this.args);
    });

    it('should extract options', function() {
      var actual = this.adapter.options(this.provider);
      actual.foo.should.equal(this.options.foo);
      actual.bar.should.equal(this.options.bar);
    });
  });

  describe('optimist', function() {
    beforeEach(function() {
      this.provider = require('optimist').argv;
      this.adapter = require('../../lib/adapter/optimist');
    });

    it('should extract args', function() {
      this.adapter.args(this.provider).should.deep.equal(this.args);
    });

    it('should extract options', function() {
      var actual = this.adapter.options(this.provider);
      actual.foo.should.equal(this.options.foo);
      actual.bar.should.equal(this.options.bar);
    });
  });
});
