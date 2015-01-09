var router = module.exports = new (require('koa-router'))();

function *renderIndex(next) {
  this.locals.me = yield this.api.users('me').get();
  this.locals.projects = yield this.api.projects.get();

  if (this.locals.projects.length) {
    if (this.params.projectId) {
      this.locals.currentProject = yield this.api.projects(this.params.projectId).get();
    } else {
      this.locals.currentProject = yield this.api.projects(this.locals.projects[0].id).get();
    }
  } else {
    this.locals.currentProject = null;
  }
  yield next;
}

router.get('/', renderIndex, function *() {
  yield this.render('index');
});

router.get('/projects/:projectId', renderIndex, function *() {
  yield this.render('index');
});
