var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;

global.sinon = require('sinon');

global.fixtures = require('./fixtures');

var tser = require('tser');

var api = require('../../');
Object.defineProperty(global, 'api', {
  get: function() {
    return tser(api, {
      defaults: { json: true }
    });
  }
});

