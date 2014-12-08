describe('PATCH /users', function() {
  beforeEach(function() {
    return fixtures.load();
  });

  it('should return 401 without auth', function() {
    return api.users(fixtures.users[0].id).patch({
      name: 'updated name'
    }).then(function(user) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(401);
    });
  });

  it('should return 403 when patch other people', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).users(fixtures.users[1].id).patch({
      name: 'updated name'
    }).then(function(user) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(403);
    });
  });

  it('should return 404 when not found', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).users(123456789).patch({
      name: 'updated name'
    }).then(function(user) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(404);
    });
  });

  it('should update the specific properties', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).users(user.id).patch({
      name: 'updated name'
    }).then(function(user) {
      expect(user).to.have.property('name', 'updated name');
    });
  });
});