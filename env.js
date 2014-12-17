if (typeof ENV_FLAG === 'undefined') {
  GLOBAL.ENV_FLAG = true;

  GLOBAL._ = require('lodash');

  GLOBAL.$config = require('config');
  GLOBAL.HTTP_ERROR = require('./errors');
  _.assign(GLOBAL, require('./models'));
}
