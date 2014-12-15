var chai = require('chai');

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

