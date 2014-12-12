describe('POST /users', function() {
  beforeEach(function() {
    return fixtures.load();
  });

  it('should create a user and return the appropriate properties', function() {
    return api.users.post({
      name: 'Tom',
      email: 'tom@email.com',
      password: '123'
    }).then(function(user) {
      expect(user).to.have.property('id');
      expect(user).to.have.property('name', 'Tom');
      expect(user).to.have.property('email', 'tom@email.com');
      expect(user).to.have.have.property('isAdmin', false);
      expect(user).to.not.have.property('password');
    });
  });

  it.only('should return 403 when signing up is disabled', function() {
    return Setting.set('enableSignUp', false).then(function() {
      return api.users.post({
        name: 'Tom',
        email: 'tom@email.com',
        password: '123'
      }).then(function() {
        throw new Error('should reject');
      }).catch(function(err) {
        expect(err.statusCode).to.eql(403);
      });
    });
  });

  it('should reject when missing required properties', function() {
    return api.users.post({
      email: 'tom@email.com'
    }).then(function(body) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.body).to.have.property('error', 'Parameter Error');
      expect(err.statusCode).to.eql(400);
    });
  });

  it('should become admin if one is the first user', function() {
    return fixtures.unload().then(function() {
      return api.users.post({
        name: 'Tom',
        email: 'tom@email.com',
        password: '123'
      }).then(function(user) {
        return User.find({
          where: { id: user.id }
        }).then(function(user) {
          expect(user.isAdmin).to.eql(true);
        });
      });
    });
  });
});
