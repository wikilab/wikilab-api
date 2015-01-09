var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  this.assert(this.me.getDataValue('authScope') === 'basic-auth', new HTTP_ERROR.NoPermission());

  this.body = yield Session.create({
    ttl: this.request.body.ttl,
    UserId: this.me.id
  });
});
