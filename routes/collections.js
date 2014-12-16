var router = module.exports = new (require('koa-router'))();

router.param('collectionId', function *(id, next) {
  this.collection = yield Collection.find(id);
  this.assert(this.collection, new HTTP_ERROR.NotFound('Collection %s', id));

  this.project = yield this.collection.getProject();
  this.assert(this.project, 409);

  this.permission = yield this.me.getPermission(this.project);

  this.checkPermission = function(permission) {
    return ProjectTeam.higherPermission(permission, this.permission) === this.permission;
  };
  yield next;
});

router.get('/:collectionId', function *() {
  this.assert(this.checkPermission('read'), new HTTP_ERROR.NoPermission());
  this.collection.setDataValue('project', this.project);

  this.body = this.collection;
});

router.get('/:collectionId/dirs', function *() {
  this.assert(this.checkPermission('read'), new HTTP_ERROR.NoPermission());
  this.body = yield this.collection.getDirs();
});
