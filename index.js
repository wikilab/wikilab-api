require('./env');
var koa = require('koa');
var app = koa();
app.use(require('koa-bodyparser')());

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
      this.body = err.message;
    }
    this.app.emit('error', err, this);
  }
});

require('./routes')(app);

if (require.main === module) {
  app.listen(4000);
} else {
  module.exports = app;
}
