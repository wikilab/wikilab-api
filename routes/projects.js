var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  this.assert(this.me.isOwner, new HTTP_ERROR.NoPermission());

  var body = this.request.body;
  this.assert(body.name, new HTTP_ERROR.InvalidParameter('name is required'));

  this.body = yield Project.create({ name: body.name });
});

router.get('/', function *() {
  var teams = yield this.me.getTeams();

  var projects = {};
  var mergeProjectsByPermission = function(project) {
    if (projects[project.id]) {
      var currentPermission = projects[project.id].ProjectTeam.permission;
      var newPermission = project.ProjectTeam.permission;
      if (ProjectTeam.higherPermission(currentPermission, newPermission) === newPermission) {
        projects[project.id] = project;
      }
    } else {
      projects[project.id] = project;
    }
  };
  for (var i = 0; i < teams.length; ++i) {
    var team = teams[i];
    var teamProjects = yield team.getProjects();
    teamProjects.forEach(mergeProjectsByPermission);
  }

  projects = Object.keys(projects).map(function(id) {
    return projects[id];
  });

  var _this = this;
  if (this.query.permission) {
    projects = projects.filter(function(project) {
      return project.ProjectTeam.permission === _this.query.permission;
    });
  }

  if (this.query.sort) {
    var field = this.query.sort.slice(1);
    projects = projects.sort(function(a, b) {
      return (a[field] - b[field]) * (_this.query.sort[0] === '+' ? 1 : -1);
    });
  }


  projects.forEach(function(project) {
    project = project.dataValues;
    project.permission = project.ProjectTeam.permission;
    delete project.ProjectTeam;
  });

  this.body = projects;
});

router.param('projectId', function *(id, next) {
  this.project = yield Project.find(id);
  this.assert(this.project, new HTTP_ERROR.NotFound('Project %s', id));
  yield next;
});

router.get('/:projectId', function *() {
  this.assert(yield this.me.havePermission(this.project, 'read'),
              new HTTP_ERROR.NoPermission());

  var collections = yield this.project.getCollections();
  this.project.setDataValue('collections', collections);

  this.body = this.project;
});

router.put('/:projectId/teams/:teamId', function *() {
  this.assert(yield this.me.havePermission(this.project, 'admin'), new HTTP_ERROR.NoPermission());
  this.assert(typeof this.request.body.permission !== 'undefined',
              new HTTP_ERROR.InvalidParameter('permission is required'));

  var team = yield Team.find({
    where: { id: this.params.teamId },
    attributes: ['id']
  });
  this.assert(team, new HTTP_ERROR.NotFound());
  var relation = yield ProjectTeam.find({
    where: { TeamId: team.id, ProjectId: this.project.id }
  });
  var previous = relation ? relation.permission : null;
  var current = this.request.body.permission;
  if (previous !== current) {
    if (relation) {
      if (current) {
        relation.permission = current;
        yield relation.save();
      } else {
        yield relation.destroy();
      }
    } else {
      yield this.project.addTeams(team, { permission: current });
    }
  }
  this.body = {
    permissions: { previous: previous, current: current }
  };
});
