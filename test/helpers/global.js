var chai = require('chai');

GLOBAL.expect = chai.expect;
GLOBAL.sinon = require('sinon');
GLOBAL.fixtures = require('./fixtures');

var app = require('../../');
app.listen($config.port);

chai.use(function (_chai, utils) {
  chai.Assertion.addMethod('error', function(error) {
    var obj = utils.flag(this, 'object');
    new chai.Assertion(obj).to.have.deep.property('body.type', error.prototype.name);
    new chai.Assertion(obj).to.have.property('statusCode', error.prototype.status);
  });
});
