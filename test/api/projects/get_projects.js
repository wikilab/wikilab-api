describe('GET /projects', function() {
  beforeEach(function *() {
    yield fixtures.load();
    yield fixtures.users[0].addTeams([
      fixtures.teams[1],
      fixtures.teams[2],
      fixtures.teams[3]
    ]);
    yield fixtures.teams[1].addProjects([
      fixtures.projects[0],
      fixtures.projects[1]
    ], { permission: 'read' });
    yield fixtures.teams[2].addProjects([
      fixtures.projects[1],
      fixtures.projects[2]
    ], { permission: 'write' });
    yield fixtures.teams[3].addProjects([
      fixtures.projects[1],
      fixtures.projects[3]
    ], { permission: 'admin' });
  });

  it('should return all my projects with correct permission', function *() {
    var user = fixtures.users[0];
    var projects = yield api.$auth(user.email, user.password).projects.get();
    expect(projects).to.have.length(4);
    projects.forEach(function(project) {
      switch (project.id) {
      case fixtures.projects[0].id:
        expect(project).to.have.property('permission', 'read');
        break;
      case fixtures.projects[1].id:
        expect(project).to.have.property('permission', 'admin');
        break;
      case fixtures.projects[2].id:
        expect(project).to.have.property('permission', 'write');
        break;
      case fixtures.projects[3].id:
        expect(project).to.have.property('permission', 'admin');
        break;
      }
    });
  });

  describe('?permission=:permission', function() {
    it('should filter permission', function *() {
      var user = fixtures.users[0];
      var projects = yield api.$auth(user.email, user.password).projects.get({
        permission: 'write'
      });
      expect(projects).to.have.length(1);
      expect(projects[0].id).to.eql(fixtures.projects[2].id);
    });
  });

  describe('?sort=+fieldName(id, createdAt, updatedAt)', function() {
    ['asc', 'desc'].forEach(function(order) {
      it('should support sort id ' + order, function *() {
        var user = fixtures.users[0];
        var projects = yield api.$auth(user.email, user.password).projects.get({
          sort: (order === 'asc' ? '+' : '-') + 'id'
        });
        for (var i = 1; i < projects.length; ++i) {
          expect(projects[i].id).to.be[order === 'asc' ? 'gte' : 'lte'](projects[i - 1].id);
        }
      });
    });
  });
});
