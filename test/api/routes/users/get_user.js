describe('GET /users/:user', function() {
  beforeEach(function *() {
    yield fixtures.load('users');
    this.user = fixtures.users[0];
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield API.users(fixtures.users[0]).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return info', function *() {
    var user = yield API.$auth(this.user.email, this.user.password).users(this.user.id).get();
    expect(user).to.have.property('name', this.user.name);
    expect(user).to.have.property('isOwner', this.user.isOwner);
    expect(user).to.have.property('email', this.user.email);
    expect(user).to.not.have.property('password');
  });

  it('should be able to get others info', function *() {
    var user = yield API.$auth(fixtures.users[1].email, fixtures.users[1].password).users(this.user.id).get();
    expect(user).to.have.property('name', this.user.name);
    expect(user).to.have.property('isOwner', this.user.isOwner);
    expect(user).to.have.property('email', this.user.email);
    expect(user).to.not.have.property('password');
  });

  describe('alias me', function() {
    it('should return info', function *() {
      var me = yield API.$auth(this.user.email, this.user.password).users('me').get();
      expect(me).to.have.property('name', this.user.name);
      expect(me).to.have.property('isOwner', this.user.isOwner);
      expect(me).to.have.property('email', this.user.email);
      expect(me).to.not.have.property('password');
    });
  });
});
