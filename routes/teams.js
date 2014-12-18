var router = module.exports = new (require('koa-router'))();

router.get('/', function *() {
  this.assert(this.me, new HTTP_ERROR.NoPermission());

  var options = {};
  if (this.query.fields) {
    var fields = this.query.fields.split(',');
    if (fields.indexOf('users') !== -1) {
      options.include = [{ model: User, attributes: ['id', 'name', 'isOwner'] }];
    }
  }

  var teams = yield Team.findAll(options);

  this.body = teams.map(function(team) {
    team = team.dataValues;
    if (typeof team.Users !== 'undefined') {
      team.users = team.Users.map(function(user) {
        user = user.dataValues;
        user.joinedAt = user.TeamsUsers.createdAt;
        delete user.TeamsUsers;
        return user;
      });
      delete team.Users;
    }
    return team;
  });
});

router.post('/', function *() {
  this.assert(this.me.isOwner, new HTTP_ERROR.NoPermission());

  this.body = yield Team.create({
    name: this.request.body.name
  });
});
