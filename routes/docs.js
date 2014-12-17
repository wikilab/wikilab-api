var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  this.assert(this.me.isOwner, new HTTP_ERROR.NoPermission());

  this.body = yield Team.create({
    name: this.request.body.name
  });
});
