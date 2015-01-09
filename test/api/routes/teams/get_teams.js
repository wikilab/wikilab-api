describe('GET /teams', function() {
  beforeEach(function *() {
    yield fixtures.load();
    yield fixtures.users[0].addTeams(fixtures.teams[0]);
    this.user = fixtures.users[0];
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield API.teams.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return all teams', function *() {
    var teams = yield API.$auth(this.user.email, this.user.password).teams.get();
    expect(teams).to.have.length(fixtures.teams.length);

    var team = teams[0];
    expect(team).to.have.property('name');
    expect(team).to.have.property('createdAt');
  });

  describe('?fields=users', function() {
    it('should include specified fields', function *() {
      var teams = yield API.$auth(this.user.email, this.user.password).teams.get({ fields: 'users' });
      var team = teams[0];
      expect(team).to.have.property('users');
    });
  });
});
