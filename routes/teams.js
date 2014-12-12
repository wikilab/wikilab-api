var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  this.assert(this.me.isAdmin, 403);

  this.body = yield Team.create({
    name: this.request.body.name
  });
});

router.get('/teams', function *() {
});
