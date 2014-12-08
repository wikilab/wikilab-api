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
      expect(user).to.not.have.property('password');
    });
  });

  it('should reject when missing required properties', function() {
    return api.users.post({
      email: 'tom@email.com'
    }).then(function(body) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.body.error).to.eql('Parameter Error');
      expect(err.statusCode).to.eql(400);
    });
  });

  it('should become the owner if one is the first user', function() {
    return fixtures.unload().then(function() {
      return api.users.post({
        name: 'Tom',
        email: 'tom@email.com',
        password: '123'
      }).then(function(user) {
        return User.find({
          where: { id: user.id },
          include: [{ model: Team }]
        }).then(function(user) {
          expect(user.Teams).to.have.length(1);
          expect(user.Teams[0]).to.have.property('type', 'owner');
        });
      });
    });
  });
});
