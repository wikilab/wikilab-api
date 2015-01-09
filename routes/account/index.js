var router = module.exports = new (require('koa-router'))();

router.get('/signin', function *() {
  yield this.render('account/signin');
});

router.post('/signin', function *() {
  var remember = this.request.body.remember === 'on';
  var result = yield this.api
    .$auth(this.request.body.email, this.request.body.password)
    .sessions.post({ ttl: remember ? 86400 : 1209600 });

  var cookieOptions = {
    expires: remember ? new Date(Date.now() + result.ttl) : undefined
  };
  this.cookies.set('session-token', result.token, cookieOptions);

  this.redirect(this.query.next ? this.query.next : '/');
});
