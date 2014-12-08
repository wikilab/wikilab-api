var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  this.body = yield User.create(this.request.body);
});

router.param('user', function *(id, next) {
  if (id === 'me') {
    this.user = this.me;
  } else {
    this.user = yield User.find(id);
  }
  this.assert(this.user, 404, {
    error: 'Not Found'
  });
  yield next;
});

router.patch('/:user', function *(next) {
  this.assert(this.me, 401);
  this.assert(this.me.id === this.user.id, 403);

  var properties = ['name', 'email'];
  var changedProperty = {};
  var _this = this;
  properties.forEach(function(property) {
    if (typeof _this.request.body[property] === 'string' && _this.user[property] !== _this.request.body[property]) {
      changedProperty[property] = _this.request.body[property];
    }
  });

  if (Object.keys(changedProperty).length > 0) {
    this.body = yield this.user.updateAttributes(changedProperty);
  } else {
    this.body = this.user;
  }
});
