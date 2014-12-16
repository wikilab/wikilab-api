var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  var isFirstUser = (yield User.count()) === 0;

  var allowSignUp = isFirstUser || (yield Setting.get('enableSignUp', true));
  this.assert(allowSignUp, new HTTP_ERROR.NoPermission('Sign up is disabled'));

  var user = User.build(this.request.body);
  if (isFirstUser) {
    user.isAdmin = true;
  }
  this.body = yield user.save();
});

router.param('user', function *(id, next) {
  if (id === 'me') {
    this.user = this.me;
  } else {
    this.user = yield User.find(id);
  }
  this.assert(this.user, new HTTP_ERROR.NotFound('User', id));
  yield next;
});

router.patch('/:user', function *(next) {
  this.assert(this.me.id === this.user.id, new HTTP_ERROR.NoPermission());

  var properties = ['name', 'email'];
  var _this = this;
  properties.forEach(function(property) {
    if (typeof _this.request.body[property] !== 'undefined') {
      _this.user[property] = _this.request.body[property];
    }
  });

  this.body = yield this.user.save();
});

router.put('/:user/password', function *(next) {
  this.assert(this.me.id === this.user.id, new HTTP_ERROR.NoPermission());

  var isPasswordCorrect = yield this.me.comparePassword(this.request.body.oldPassword);
  this.assert(isPasswordCorrect, new HTTP_ERROR.WrongPassword());

  this.body = yield this.me.updatePassword(this.request.body.newPassword);
});
