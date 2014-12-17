if (typeof ENV_FLAG === 'undefined') {
  GLOBAL.ENV_FLAG = true;

  GLOBAL.$config = require('config');
  var mergeObject = function(obj1, obj2) {
    Object.keys(obj2).forEach(function(key) {
      obj1[key] = obj2[key];
    });
  };

  mergeObject(GLOBAL, require('./models'));
  GLOBAL.HTTP_ERROR = require('./errors');

  // Middlewares
  GLOBAL.auth = function(isOwner) {
    return function *(next) {
      this.assert(this.me, new HTTP_ERROR.Unauthorized());
      if (isOwner) {
        this.assert(this.me.isOwner, new HTTP_ERROR.NoPermission());
      }
      yield next;
    };
  };
}
