describe('PUT /users/:user/password', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield api.users('me').password.put();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission when change other\'s password', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).users(fixtures.users[1].id).password.put();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return NotFound when not found', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).users(123456789).password.put();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return WrongPassword with wrong old password', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).users(user.id).password.put({
        newPassword: 'updated password',
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.WrongPassword);
    }
  });

  it('should change the password successfully with correct old password', function *() {
    var user = fixtures.users[0];
    yield api.$auth(user.email, user.password).users(user.id).password.put({
      oldPassword: user.password,
      newPassword: 'new password'
    });
    yield user.reload();
    expect(yield user.comparePassword('new password')).to.eql(true);
  });
});
