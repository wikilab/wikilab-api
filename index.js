require('./env');
var http = require('http');
var koa = require('koa');
var app = koa();

app.use(require('koa-bodyparser')());

// Error handling
app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      this.status = 400;
      this.body = {
        error: 'Parameter Error',
        messages: err.errors.map(function(err) {
          return err.message;
        })
      };
    } else {
      this.status = err.status || 500;
      err.error = err.error || http.STATUS_CODES[this.status];
      this.body = {
        error: err.error
      };
    }
  }
});

// Basic auth
var auth = require('basic-auth');
app.use(function *(next) {
  var user = auth(this.req);
  if (user) {
    this.assert(user, 401);
    var userInstance = yield User.find({ where: { email: user.name } });
    this.assert(userInstance, 401);
    this.assert(yield userInstance.comparePassword(user.pass), 401);
    this.me = userInstance;
  } else {
    this.assert(this.path === '/users', 401);
  }
  yield next;
});

require('./routes')(app);

if (require.main === module) {
  app.listen($config.port || 4000);
} else {
  module.exports = app;
}
