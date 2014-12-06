var router = module.exports = new (require('koa-router'))();

router.get('/', function *() {
  this.body = { name: 'bob' };
});
