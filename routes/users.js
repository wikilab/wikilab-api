var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  var hasOwnerTeam = (yield Team.count({ where: { type: 'owner' } })) !== 0;

  var allowSignUp = !hasOwnerTeam || (yield Setting.get('enableSignUp', true));
  this.assert(allowSignUp, 403, 'Sign up is disabled');

  var user = yield User.create(this.request.body);
  if (!hasOwnerTeam) {
    var ownerTeam = yield Team.create({ name: 'Owner', type: 'owner' });
    yield user.addTeam(ownerTeam);
  }
  this.body = user;
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
  this.assert(this.me.id === this.user.id, 403);

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
  this.assert(this.me.id === this.user.id, 403);

  var isPasswordCorrect = yield this.me.comparePassword(this.request.body.oldPassword);
  this.assert(isPasswordCorrect, 400, { error: 'Wrong Password' });

  this.body = yield this.me.updatePassword(this.request.body.newPassword);
});
