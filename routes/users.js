var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  this.body = yield User.create(this.request.body);
});
