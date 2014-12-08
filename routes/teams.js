var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  this.assert(this.me, 401);
  this.assert(yield this.me.isOwner(), 403);

  this.body = yield Team.create({
    name: this.request.body.name
  });
});
