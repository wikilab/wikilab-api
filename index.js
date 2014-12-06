var koa = require('koa');
var app = koa();
app.use(require('koa-bodyparser')());

app.use(function *(next){
  var start = new Date();
  yield next;
  var ms = new Date() - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

require('./routes')(app);

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(4000);
