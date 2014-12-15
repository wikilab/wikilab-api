describe('Model.User', function() {
  beforeEach(function *() {
    $config.bcryptRound = 1;
    yield fixtures.load();
  });

  afterEach(function() {
    $config.bcryptRound = null;
  });

  describe('password', function() {
    it('should hash the password when create', function *() {
      var user = yield User.create({
        name: 'Tom',
        email: 'tom@email.com',
        password: '123'
      });
      expect(user.password).to.not.eql('123');
      expect(yield user.comparePassword('123')).to.eql(true);
    });

    describe('#updatePassword()', function() {
      it('should update the password hashed', function *() {
        var user = fixtures.users[0];
        yield user.updatePassword('new password');
        expect(yield user.comparePassword('new password')).to.eql(true);
      });

      it('should leave the other attrs unchanged', function *() {
        var user = fixtures.users[0];
        var oldName = user.name;
        user.name = 'new name';
        yield user.updatePassword('new password');
        expect(yield user.reload()).to.have.property('name', oldName);
      });
    });
  });

  describe('#havePermission()', function() {
    beforeEach(function *() {
      yield fixtures.users[0].addTeams([
        fixtures.teams[1],
        fixtures.teams[2],
        fixtures.teams[3]
      ]);
      yield fixtures.teams[1].addProjects([
        fixtures.projects[0]
      ], { permission: 'read' });
      yield fixtures.teams[2].addProjects([
        fixtures.projects[1],
        fixtures.projects[2]
      ], { permission: 'write' });
      yield fixtures.teams[3].addProjects([
        fixtures.projects[1],
      ], { permission: 'admin' });
    });

    it('should return the correct result', function *() {
      var user = fixtures.users[0];
      var projects = fixtures.projects;
      expect(yield user.havePermission(projects[0], 'read')).to.eql(true);
      expect(yield user.havePermission(projects[0], 'write')).to.eql(false);
      expect(yield user.havePermission(projects[0], 'admin')).to.eql(false);
      expect(yield user.havePermission(projects[1], 'read')).to.eql(true);
      expect(yield user.havePermission(projects[1], 'write')).to.eql(true);
      expect(yield user.havePermission(projects[1], 'admin')).to.eql(true);
      expect(yield user.havePermission(projects[2], 'admin')).to.eql(false);
      expect(yield user.havePermission(projects[3], 'read')).to.eql(false);
      expect(yield user.havePermission(projects[3], 'admin')).to.eql(false);
    });
  });
});
