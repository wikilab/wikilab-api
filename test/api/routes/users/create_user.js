describe('POST /users', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should create a user and return the appropriate properties', function *() {
    var user = yield API.users.post({
      name: 'Tom',
      email: 'tom@email.com',
      password: '123'
    });
    expect(user).to.have.property('id');
    expect(user).to.have.property('name', 'Tom');
    expect(user).to.have.property('email', 'tom@email.com');
    expect(user).to.have.have.property('isOwner', false);
    expect(user).to.not.have.property('password');
  });

  it('should return NoPermission when signing up is disabled', function *() {
    yield Setting.set('enableSignUp', false);
    try {
      yield API.users.post({
        name: 'Tom',
        email: 'tom@email.com',
        password: '123'
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter when missing required properties', function *() {
    try {
      yield API.users.post({
        email: 'tom@email.com'
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should become admin if one is the first user', function *() {
    yield fixtures.unload();
    var returnedUser = yield API.users.post({
      name: 'Tom',
      email: 'tom@email.com',
      password: '123'
    });
    var user = yield User.find({
      where: { id: returnedUser.id }
    });
    expect(user.isOwner).to.eql(true);
  });
});
