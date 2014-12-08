describe('PUT /users/:user/password', function() {
  beforeEach(function() {
    return fixtures.load();
  });

  it('should return 401 without auth', function() {
    return api.users(fixtures.users[0].id).password.put().then(function(user) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(401);
    });
  });

  it('should return 403 when patch other people', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).users(fixtures.users[1].id).password.put().then(function(user) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(403);
    });
  });

  it('should return 404 when not found', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).users(123456789).password.put().then(function(user) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(404);
    });
  });

  it('should return 400 with wrong password', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).users(user.id).password.put({
      newPassword: 'updated password',
    }).then(function(user) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(400);
      expect(err.body.error).to.eql('Wrong Password');
    });
  });

  it('should change the password successfully with correct password', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).users(user.id).password.put({
      oldPassword: user.password,
      newPassword: 'new password'
    }).then(function(l) {
      return user.reload().then(function(user) {
        return expect(user.comparePassword('new password')).to.become(true);
      });
    });
  });
});
