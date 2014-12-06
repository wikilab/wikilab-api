var tser = require('tser');
var fixtures = require('../helpers/fixtures');

describe('create user', function() {
  beforeEach(function() {
    return fixtures.load();
  });
  afterEach(function() {
    return fixtures.unload();
  });

  it('should log', function() {
    return User.create({
      name: 'Tom',
      email: 'tom@email.com',
      password: '123'
    });
  });
});
