var router = module.exports = new (require('koa-router'))();

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
