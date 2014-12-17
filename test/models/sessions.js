describe('Model.Session', function() {
  beforeEach(function *() {
    yield fixtures.load('users');
  });

  describe('.getUser()', function() {
    it('should return null when user is not found', function *() {
      var session = yield Session.create({ ttl: 600 });
      expect(yield Session.getUser(session.token)).to.eql(null);
    });

    it('should return null when token is not found', function *() {
      expect(yield Session.getUser('not exists session')).to.eql(null);
    });

    it('should return null when token is expired', function *() {
      var session = yield Session.create({ ttl: 600, UserId: fixtures.users[0].id });
      yield session.updateAttributes({ expiredAt: new Date(Date.now() - 1) });
      expect(yield Session.getUser(session.token)).to.eql(null);
    });

    it('should return the user', function *() {
      var user = fixtures.users[0];
      var session = yield Session.create({ ttl: 600, UserId: user.id });
      expect(yield Session.getUser(session.token)).to.have.property('id', user.id);
    });

    it('should remove all expired sessions when Math.random() is less then 0.01', function *() {
      var expiredSession = yield Session.create({ ttl: 600, UserId: fixtures.users[0].id });
      yield expiredSession.updateAttributes({ expiredAt: new Date(Date.now() - 1000) });

      var session = yield Session.create({ ttl: 600, UserId: fixtures.users[0].id });
      sinon.stub(Math, 'random', function() { return 0.005; });
      yield Session.getUser(session.token);
      expect(yield Session.find(expiredSession.id)).to.eql(null);
      Math.random.restore();
    });
  });
});
