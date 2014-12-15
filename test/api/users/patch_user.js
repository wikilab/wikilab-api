describe('PATCH /users/:user', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should return 403 when patch other people', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).users(fixtures.users[1].id).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err.statusCode).to.eql(403);
    }
  });

  it('should return 404 when not found', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).users(123456789).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err.statusCode).to.eql(404);
    }
  });

  it('should update the specific properties', function *() {
    var user = fixtures.users[0];
    var returnedUser = yield api.$auth(user.email, user.password).users(user.id).patch({
      name: 'updated name'
    });
    expect(returnedUser).to.have.property('name', 'updated name');
    expect(returnedUser).to.have.property('email', user.email);
    expect(yield user.reload()).to.have.property('name', 'updated name');
  });

  it('should support alias "me"', function *() {
    var user = fixtures.users[0];
    var returnedUser = yield api.$auth(user.email, user.password).users('me').patch({
      name: 'updated name'
    });
    expect(returnedUser).to.have.property('name', 'updated name');
  });
});
