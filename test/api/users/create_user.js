describe('POST /users', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should create a user and return the appropriate properties', function *() {
    var user = yield api.users.post({
      name: 'Tom',
      email: 'tom@email.com',
      password: '123'
    });
    expect(user).to.have.property('id');
    expect(user).to.have.property('name', 'Tom');
    expect(user).to.have.property('email', 'tom@email.com');
    expect(user).to.have.have.property('isAdmin', false);
    expect(user).to.not.have.property('password');
  });

  it('should return 403 when signing up is disabled', function *() {
    yield Setting.set('enableSignUp', false);
    try {
      yield api.users.post({
        name: 'Tom',
        email: 'tom@email.com',
        password: '123'
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err.statusCode).to.eql(403);
    }
  });

  it('should reject when missing required properties', function *() {
    try {
      yield api.users.post({
        email: 'tom@email.com'
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err.body).to.have.property('error', 'Parameter Error');
      expect(err.statusCode).to.eql(400);
    }
  });

  it('should become admin if one is the first user', function *() {
    yield fixtures.unload();
    var returnedUser = yield api.users.post({
      name: 'Tom',
      email: 'tom@email.com',
      password: '123'
    });
    var user = yield User.find({
      where: { id: returnedUser.id }
    });
    expect(user.isAdmin).to.eql(true);
  });
});
