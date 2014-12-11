describe('POST /teams', function() {
  beforeEach(function() {
    return fixtures.load().then(function() {
      return fixtures.users[0].addTeams(fixtures.teams[0]);
    });
  });

  it('should return 403 if is not owner', function() {
    var user = fixtures.users[1];
    return api.$auth(user.email, user.password).teams.post().then(function() {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(403);
    });
  });

  it('should reject without the "name" parameter', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).teams.post({}).then(function() {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.body).to.have.property('error', 'Parameter Error');
      expect(err.statusCode).to.eql(400);
    });
  });

  it('should create a user team correctly', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).teams.post({
      name: 'team name'
    }).then(function(team) {
      expect(team).to.have.property('name', 'team name');
      expect(team).to.have.property('type', 'user');
    });
  });
});
