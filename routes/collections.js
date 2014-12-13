var router = module.exports = new (require('koa-router'))();

router.param('collectionId', function *(id, next) {
  this.collection = yield Collection.find(id);
  this.assert(this.collection, 404);

  this.project = yield this.collection.getProject();
  this.assert(this.project, 409);

  this.permission = yield this.me.getPermission(this.project);

  this.checkPermission = function(permission) {
    return ProjectTeam.higherPermission(permission, this.permission) === this.permission;
  };
  yield next;
});

router.get('/:collectionId', function *() {
  this.assert(this.checkPermission('read'), 403);
  this.collection.setDataValue('project', this.project);

  var docs = yield this.collection.getDocs({ attributes: ['UUID', 'parentUUID'] });

  var treeDoc = {};
  docs = docs.map(function(doc) {
    doc = doc.dataValues;
    treeDoc[doc.UUID] = doc;
    doc.children = [];
    return doc;
  });
  docs.forEach(function(doc) {
    if (doc.parentUUID) {
      treeDoc[doc.parentUUID].children.push(doc);
      doc.isChild = true;
    }
  });
  docs = [];
  Object.keys(treeDoc).forEach(function(key) {
    if (!treeDoc[key].isChild) {
      docs.push(treeDoc[key]);
    }
  });
  this.collection.setDataValue('dirs', docs);

  this.body = this.collection;
});
