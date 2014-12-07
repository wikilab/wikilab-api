var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;

global.fixtures = require('./fixtures');

var tser = require('tser');
global.api = tser(require('../../'));
