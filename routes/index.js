var routes = require('node-require-directory')(__dirname);
var mount = require('koa-mount');

module.exports = function(app) {
  Object.keys(routes).forEach(function(key) {
    if (key !== 'index') {
      app.use(mount('/' + key, routes[key].middleware()));
    }
  });
};
