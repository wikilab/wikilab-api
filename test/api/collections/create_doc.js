describe('POST /collections/:collectionId/docs', function() {
  beforeEach(function *() {
    yield fixtures.load();
    yield fixtures.users[0].addTeam(fixtures.teams[0]);
    yield fixtures.users[1].addTeam(fixtures.teams[1]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'write' });
    yield fixtures.teams[1].addProject(fixtures.projects[0], { permission: 'read' });
    yield fixtures.projects[0].addCollection(fixtures.collections[0]);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield api.collections(fixtures.collections[0].id).docs.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when collection is not found', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).collections(1993).docs.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have write permission', function *() {
    var user = fixtures.users[1];
    var collection = fixtures.collections[0];
    try {
      yield api.$auth(user.email, user.password).collections(collection.id).docs.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter when parameters are invalid', function *() {
    var user = fixtures.users[0];
    var collection = fixtures.collections[0];
    var base = api.$auth(user.email, user.password).collections(collection.id).docs;
    try {
      yield base.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
    try {
      yield base.post({ title: '123' });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should create a new doc', function *() {
    var user = fixtures.users[0];
    var collection = fixtures.collections[0];
    var doc = yield api.$auth(user.email, user.password).collections(collection.id).docs.post({
      title: 'new title',
      content: 'new content'
    });
    expect(doc.title).to.eql('new title');
    expect(doc.content).to.eql('new content');
    expect(doc.current).to.eql(true);
    expect(doc.distance).to.eql(0);
    expect(doc.CollectionId).to.eql(collection.id);
    /* jshint expr:true */
    expect(doc.parentUUID).to.not.exist;
  });

  it('should set parentUUID if specified', function *() {
    var user = fixtures.users[0];
    var collection = fixtures.collections[0];
    var parentDoc = fixtures.docs[0];
    yield collection.addDocs(parentDoc);
    var doc = yield api.$auth(user.email, user.password).collections(collection.id).docs.post({
      title: 'new title',
      content: 'new content',
      parentUUID: parentDoc.UUID
    });
    expect(doc.parentUUID).to.eql(parentDoc.UUID);
  });

  it('should return InvalidParameter and rollback when parentUUID is invalid', function *() {
    var user = fixtures.users[0];
    var collection = fixtures.collections[0];
    try {
      yield api.$auth(user.email, user.password).collections(collection.id).docs.post({
        title: 'new title',
        content: 'new content',
        parentUUID: 'invalid uuid'
      });
    } catch(err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });
});
