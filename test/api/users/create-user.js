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
    api.users.post({
      name: 'Tom',
      email: 'tom@email.com',
      password: '123'
    }).then(function(body) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.body.error).to.be.instanceof(Array);
      expect(err.statusCode).to.eql(400);
    });
  });
});
