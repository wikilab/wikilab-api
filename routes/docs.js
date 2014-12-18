var router = module.exports = new (require('koa-router'))();

router.param('docUUID', function *(id, next) {
  var query = { UUID: id };
  if (this.query.version) {
    query.version = this.query.version;
  } else {
    query.current = true;
  }
  try {
    this.doc = yield Doc.find({
      where: query,
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
  this.assert(this.doc, new HTTP_ERROR.NotFound('Doc %s', id));

  this.permission = yield this.me.getPermission(this.doc.Collection.Project);

  this.checkPermission = function(permission) {
    return ProjectTeam.higherPermission(permission, this.permission) === this.permission;
  };
  yield next;
});

router.get('/:docUUID', function *() {
  this.assert(this.checkPermission('read'), new HTTP_ERROR.NoPermission());
  this.body = this.doc;
});

router.patch('/:docUUID', function *() {
  this.assert(this.checkPermission('write'), new HTTP_ERROR.NoPermission());

  var properties = ['title', 'content'];
  var body = this.request.body;
  var changed = _.intersection(properties, Object.keys(body));

  changed = changed.filter(function(key) {
    return body[key] !== this.doc[key];
  }, this);

  var doc = this.doc;
  if (changed.length) {
    doc = yield Doc.createWithTransaction({
      CollectionId: this.doc.CollectionId,
      UUID: this.doc.UUID,
      title: typeof body.title === 'string' ? body.title : this.doc.title,
      content: typeof body.content === 'string' ? body.content : this.doc.content
    });
  }

  this.body = {
    versions: {
      previous: this.doc.version,
      current: doc.version
    },
    distance: this.doc === doc ? 0 : doc.distance,
    changedProperties: changed || []
  };
});

router.get('/:docUUID/versions', function *() {
  this.assert(this.checkPermission('read'), new HTTP_ERROR.NoPermission());
  var attributes = ['version', 'distance', 'createdAt'];
  var options = {
    where: { UUID: this.doc.UUID },
    order: [sequelize.col('version')],
    attributes: attributes
  };
  if (this.query.fields) {
    var fields = this.query.fields.split(',');
    if (fields.indexOf('title') !== -1) {
      attributes.push('title');
    }
    if (fields.indexOf('content') !== -1) {
      attributes.push('content');
    }
    if (fields.indexOf('author') !== -1) {
      options.include = [{ model: User, attributes: ['id', 'name'] }];
    }
  }
  var versions = yield this.doc.Collection.getDocs(options);
  this.body = versions.map(function(version) {
    version = version.dataValues;
    if (typeof version.User !== 'undefined') {
      version.author = version.User;
      delete version.User;
    }
    return version;
  });
});
