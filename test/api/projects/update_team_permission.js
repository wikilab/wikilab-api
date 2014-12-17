describe.only('PUT /projects/:projectId/teams/:teamId', function() {
  beforeEach(function *() {
    yield fixtures.load(['users', 'projects', 'teams']);
    this.project = fixtures.projects[0];
    this.team = fixtures.teams[0];
    this.owner = fixtures.users[0];
    this.user = fixtures.users[1];
    this.admin = fixtures.users[2];
    yield fixtures.teams[0].addUsers(fixtures.users[1]);
    yield fixtures.teams[1].addUsers(fixtures.users[2]);
    yield fixtures.projects[0].addTeams(fixtures.teams[0], { permission: 'write' });
    yield fixtures.projects[0].addTeams(fixtures.teams[1], { permission: 'admin' });
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield api.projects(this.project.id).teams(this.team.id).put();
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission if user is not owner or admin', function *() {
    try {
      yield api.$auth(this.user.email, this.user.password).projects(this.project.id).teams(this.team.id).put();
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return NotFound if team is not exists', function *() {
    try {
      yield api.$auth(this.admin.email, this.admin.password).projects(this.project.id).teams(123).put({ permission: 'read' });
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should update permission successfully if user is owner', function *() {
    yield api.$auth(this.owner.email, this.owner.password).projects(this.project.id).teams(this.team.id).put({ permission: 'read' });
  });

  it('should return InvalidParameter if permission is invalid', function *() {
    var base = api.$auth(this.admin.email, this.admin.password).projects(this.project.id).teams(this.team.id);
    try {
      yield base.put();
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
    try {
      yield base.put({ permission: 'invalid' });
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should update permission successfully and return the previous permission', function *() {
    var result = yield api.$auth(this.admin.email, this.admin.password).projects(this.project.id).teams(this.team.id).put({ permission: 'read' });
    expect(result.permission.previous).to.eql('write');
    expect(result.permission.current).to.eql('read');
  });

  it('should return null if team has no permission to the project', function *() {
    var result;
    result = yield api.$auth(this.admin.email, this.admin.password).projects(this.project.id).teams(this.team.id).put({ permission: null });
    expect(result.permission.current).to.eql(null);

    result = yield api.$auth(this.admin.email, this.admin.password).projects(this.project.id).teams(this.team.id).put({ permission: 'read' });
    expect(result.permission.previous).to.eql(null);
  });
});
