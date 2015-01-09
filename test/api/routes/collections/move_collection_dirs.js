describe('POST /collections/:collectionId/dirs/_move', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.writer = fixtures.users[1];
    this.reader = fixtures.users[2];
    yield this.writer.addTeam(fixtures.teams[0]);
    yield this.reader.addTeam(fixtures.teams[1]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'write' });
    yield fixtures.teams[1].addProject(fixtures.projects[0], { permission: 'read' });
    yield fixtures.projects[0].addCollection(fixtures.collections[0]);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield API.collections(fixtures.collections[0].id).dirs('_move').post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when collection is not found', function *() {
    try {
      yield API.$auth(this.writer.email, this.writer.password).collections(1993).dirs('_move').post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have write permission', function *() {
    var collection = fixtures.collections[0];
    try {
      yield API.$auth(this.reader.email, this.reader.password).collections(collection.id).dirs('_move').post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter when parameters are invalid', function *() {
    var collection = fixtures.collections[0];
    var base = API.$auth(this.writer.email, this.writer.password).collections(collection.id).dirs('_move');
    try {
      yield base.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
    try {
      yield base.post({ UUID: '123' });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should set parent and order', function *() {
    var collection = fixtures.collections[0];
    var doc = fixtures.docs[3];
    var parentDoc = fixtures.docs[0];
    yield collection.addDocs(fixtures.docs.slice(0, 4));
    yield fixtures.docs[1].setParent(parentDoc.UUID);
    yield fixtures.docs[2].setParent(parentDoc.UUID);
    yield doc.setParent(fixtures.docs[2].UUID);
    var dirs;
    dirs = yield collection.getDirs();
    yield API.$auth(this.writer.email, this.writer.password).collections(collection.id).dirs('_move').post({
      UUID: doc.UUID,
      parentUUID: parentDoc.UUID,
      order: 1
    });
    dirs = yield collection.getDirs();
    expect(dirs).to.have.length(1);
    expect(dirs[0].children).to.have.length(3);
    expect(dirs[0].children[1].UUID).to.eql(doc.UUID);
  });
});
