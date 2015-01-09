describe('POST /projects', function() {
  beforeEach(function *() {
    yield fixtures.load('users');
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield API.projects.post();
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission if user is not ower', function *() {
    var user = fixtures.users[1];
    try {
      yield API.$auth(user.email, user.password).projects.post();
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter if parameters is invalid', function *() {
    var user = fixtures.users[0];
    try {
      yield API.$auth(user.email, user.password).projects.post();
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should create project successfully', function *() {
    var user = fixtures.users[0];
    var returnedProject = yield API.$auth(user.email, user.password).projects.post({
      name: 'new project'
    });
    var project = yield Project.find(returnedProject .id);
    expect(project.name).to.eql('new project');
  });
});
