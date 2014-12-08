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
      if (this.status === 500) {
        console.error(err.stack);
      }
    }
  }
});

// Basic auth
var auth = require('basic-auth');
app.use(function *(next) {
  var user = auth(this.req);
  if (user) {
    var userInstance = yield User.find({ where: { email: user.name } });
    if (userInstance && (yield userInstance.comparePassword(user.pass))) {
      this.me = userInstance;
    }
  }
  yield next;
});

require('./routes')(app);

if (require.main === module) {
  app.listen(4000);
} else {
  module.exports = app;
}
