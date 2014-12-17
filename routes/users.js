var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  var isFirstUser = (yield User.count()) === 0;

  var allowSignUp = isFirstUser || (yield Setting.get('enableSignUp', true));
  this.assert(allowSignUp, new HTTP_ERROR.NoPermission('Sign up is disabled'));

  var user = User.build(this.request.body);
  if (isFirstUser) {
    user.isOwner = true;
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
  _.intersection(properties, Object.keys(this.request.body)).forEach(function(key) {
    this.user[key] = this.request.body[key];
  }, this);

  var changed = this.user.changed();
  if (changed) {
    yield this.user.save();
  }
  this.body = { changedProperties: changed || [] };
});

router.put('/:user/password', function *(next) {
  this.assert(this.me.id === this.user.id, new HTTP_ERROR.NoPermission());

  var isPasswordCorrect = yield this.me.comparePassword(this.request.body.oldPassword);
  this.assert(isPasswordCorrect, new HTTP_ERROR.WrongPassword());

  this.body = yield this.me.updatePassword(this.request.body.newPassword);
});
