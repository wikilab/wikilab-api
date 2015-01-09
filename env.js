GLOBAL._ = require('lodash');
GLOBAL.$config = require('config');

var tser = require('tser');
Object.defineProperty(GLOBAL, 'API', {
  get: function() {
    return tser('http://127.0.0.1:' + $config.port + '/api', {
      defaults: { json: true }
    });
  }
});
