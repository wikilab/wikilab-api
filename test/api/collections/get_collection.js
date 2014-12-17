describe('GET /collections/:collectionId', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.reader = fixtures.users[1];
    this.guest = fixtures.users[2];
    yield this.reader.addTeam(fixtures.teams[0]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'read' });
    yield fixtures.projects[0].addCollection(fixtures.collections[0]);
    yield fixtures.collections[0].addDocs(fixtures.docs);
    yield fixtures.docs[1].setParent(fixtures.docs[0].UUID);
    yield fixtures.docs[2].setParent(fixtures.docs[0].UUID);
    yield fixtures.docs[3].setParent(fixtures.docs[2].UUID);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield api.collections(fixtures.collections[0].id).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when collection is not found', function *() {
    try {
      yield api.$auth(this.reader.email, this.reader.password).collections(1993).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have read permission', function *() {
    var collection = fixtures.collections[0];
    try {
      yield api.$auth(this.guest.email, this.guest.password).collections(collection.id).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return the collection with it\'s project', function *() {
    var project = fixtures.projects[0];
    var collection = fixtures.collections[0];
    var returnedCollection = yield api.$auth(this.reader.email, this.reader.password).collections(collection.id).get();
    expect(returnedCollection).to.have.property('id', collection.id);
    expect(returnedCollection).to.have.property('name', collection.name);
    expect(returnedCollection.project).to.have.property('id', project.id);
  });
});
