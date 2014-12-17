var router = module.exports = new (require('koa-router'))();

router.param('docUUID', function *(id, next) {
  try {
    this.prevDoc = yield Doc.find({
      where: { UUID: id, current: true },
      include: [{
        model: Collection,
        attributes: ['id'],
        required: true,
        include: [{
          model: Project,
          attributes: ['id'],
          required: true
        }]
      }]
    });
  } catch (err) {}
  this.assert(this.prevDoc, new HTTP_ERROR.NotFound('Doc %s', id));

  this.permission = yield this.me.getPermission(this.prevDoc.Collection.Project);

  this.checkPermission = function(permission) {
    return ProjectTeam.higherPermission(permission, this.permission) === this.permission;
  };
  yield next;
});

router.patch('/:docUUID', function *() {
  this.assert(this.checkPermission('write'), new HTTP_ERROR.NoPermission());

  var properties = ['title', 'content'];
  var body = this.request.body;
  var changed = _.intersection(properties, Object.keys(body));

  changed = changed.filter(function(key) {
    return body[key] !== this.prevDoc[key];
  }, this);

  var doc = this.prevDoc;
  if (changed.length) {
    doc = yield Doc.createWithTransaction({
      CollectionId: this.prevDoc.CollectionId,
      UUID: this.prevDoc.UUID,
      title: typeof body.title === 'string' ? body.title : this.prevDoc.title,
      content: typeof body.content === 'string' ? body.content : this.prevDoc.content
    });
  }

  this.body = {
    versions: {
      previous: this.prevDoc.version,
      current: doc.version
    },
    distance: this.prevDoc === doc ? 0 : doc.distance,
    changedProperties: changed || []
  };
});
