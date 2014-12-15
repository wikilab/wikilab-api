describe('POST /teams', function() {
  beforeEach(function *() {
    yield fixtures.load();
    yield fixtures.users[0].addTeams(fixtures.teams[0]);
  });

  it('should return 403 if is not admin', function *() {
    var user = fixtures.users[1];
    try {
      yield api.$auth(user.email, user.password).teams.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err.statusCode).to.eql(403);
    }
  });

  it('should reject without the "name" parameter', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).teams.post({});
      throw new Error('should reject');
    } catch (err) {
      expect(err.body).to.have.property('error', 'Parameter Error');
      expect(err.statusCode).to.eql(400);
    }
  });

  it('should create a user team correctly', function *() {
    var user = fixtures.users[0];
    var team = yield api.$auth(user.email, user.password).teams.post({
      name: 'team name'
    });
    expect(team).to.have.property('name', 'team name');
  });
});
