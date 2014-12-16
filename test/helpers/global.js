var chai = require('chai');

global.expect = chai.expect;
global.sinon = require('sinon');
global.fixtures = require('./fixtures');

chai.use(function (_chai, utils) {
  chai.Assertion.addMethod('error', function(error) {
    var obj = utils.flag(this, 'object');
    new chai.Assertion(obj).to.have.deep.property('body.type', error.prototype.name);
    new chai.Assertion(obj).to.have.property('statusCode', error.prototype.status);
  });
});

var tser = require('tser');

var api = require('../../');
Object.defineProperty(global, 'api', {
  get: function() {
    return tser(api, {
      defaults: { json: true }
    });
  }
});

