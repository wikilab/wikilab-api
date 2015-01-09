describe('GET /projects/:projectId', function() {
  beforeEach(function *() {
    yield fixtures.load();
    yield fixtures.users[0].addTeam(fixtures.teams[0]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'read' });
    yield fixtures.projects[0].addCollections([fixtures.collections[0], fixtures.collections[1]]);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield API.projects(fixtures.projects[0].id).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when project is not found', function *() {
    var user = fixtures.users[0];
    try {
      yield API.$auth(user.email, user.password).projects(1993).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have read permission', function *() {
    var user = fixtures.users[1];
    var project = fixtures.projects[0];
    try {
      yield API.$auth(user.email, user.password).projects(project.id).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return project and it\'s collections', function *() {
    var user = fixtures.users[0];
    var project = fixtures.projects[0];
    var returnedProject = yield API.$auth(user.email, user.password).projects(project.id).get();
    expect(returnedProject).to.have.property('id', project.id);
    expect(returnedProject).to.have.property('name', project.name);
    expect(returnedProject.collections).to.have.length(2);
  });
});
