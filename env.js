if (typeof ENV_FLAG === 'undefined') {
  GLOBAL.ENV_FLAG = true;
  var mergeObject = function(obj1, obj2) {
    Object.keys(obj2).forEach(function(key) {
      obj1[key] = obj2[key];
    });
  };

  mergeObject(GLOBAL, require('./models'));
  GLOBAL.$config = require('config');
}
