describe('PATCH /users/:user', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield API.users('me').patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission when patch other people', function *() {
    var user = fixtures.users[0];
    try {
      yield API.$auth(user.email, user.password).users(fixtures.users[1].id).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return NotFound when not found', function *() {
    var user = fixtures.users[0];
    try {
      yield API.$auth(user.email, user.password).users(123456789).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should allow empty body', function *() {
    var user = fixtures.users[0];
    var result = yield API.$auth(user.email, user.password).users(user.id).patch();
    expect(result.changedProperties).to.eql([]);
  });

  it('should update the specific properties', function *() {
    var user = fixtures.users[0];
    var result = yield API.$auth(user.email, user.password).users(user.id).patch({
      name: 'updated name'
    });
    expect(result.changedProperties).to.eql(['name']);
    expect(yield user.reload()).to.have.property('name', 'updated name');
  });

  it('should support alias "me"', function *() {
    var user = fixtures.users[0];
    yield API.$auth(user.email, user.password).users('me').patch({
      name: 'updated name'
    });
    expect(yield user.reload()).to.have.property('name', 'updated name');
  });
});
