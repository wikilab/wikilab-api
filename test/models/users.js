describe('Model.User', function() {
  beforeEach(function() {
    $config.bcryptRound = 1;
    return fixtures.load();
  });

  afterEach(function() {
    $config.bcryptRound = null;
  });

  describe('password', function() {
    it('should hash the password when create', function() {
      return User.create({
        name: 'Tom',
        email: 'tom@email.com',
        password: '123'
      }).then(function(user) {
        expect(user.password).to.not.eql('123');
        return expect(user.comparePassword('123')).to.become(true);
      });
    });

    describe('#updatePassword()', function() {
      it('should update the password hashed', function() {
        var user = fixtures.users[0];
        return user.updatePassword('new password').then(function(user) {
          return expect(user.comparePassword('new password')).to.become(true);
        });
      });

      it('should leave the other attrs unchanged', function() {
        var user = fixtures.users[0];
        var oldName = user.name;
        user.name = 'new name';
        return user.updatePassword('new password').then(function(user) {
          return expect(user.reload()).to.eventually.have.property('name', oldName);
        });
      });
    });
  });

  describe('#havePermission()', function() {
    beforeEach(function() {
      return Promise.all([
        fixtures.users[0].addTeams([
          fixtures.teams[1],
          fixtures.teams[2],
          fixtures.teams[3]
        ]),
        fixtures.teams[1].addProjects([
          fixtures.projects[0]
        ], { permission: 'read' }),
        fixtures.teams[2].addProjects([
          fixtures.projects[1],
          fixtures.projects[2]
        ], { permission: 'write' }),
        fixtures.teams[3].addProjects([
          fixtures.projects[1],
        ], { permission: 'admin' })
      ]);
    });

    it('should return the correct result', function() {
      var user = fixtures.users[0];
      var projects = fixtures.projects;
      return Promise.all([
        expect(user.havePermission(projects[0], 'read')).to.become(true),
        expect(user.havePermission(projects[0], 'write')).to.become(false),
        expect(user.havePermission(projects[0], 'admin')).to.become(false),
        expect(user.havePermission(projects[1], 'read')).to.become(true),
        expect(user.havePermission(projects[1], 'write')).to.become(true),
        expect(user.havePermission(projects[1], 'admin')).to.become(true),
        expect(user.havePermission(projects[2], 'admin')).to.become(false),
        expect(user.havePermission(projects[3], 'read')).to.become(false),
        expect(user.havePermission(projects[3], 'admin')).to.become(false)
      ]);
    });
  });
});
