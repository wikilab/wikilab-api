describe('GET /collections/:collectionId', function() {
  beforeEach(function *() {
    yield fixtures.load();
    yield fixtures.users[0].addTeam(fixtures.teams[0]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'read' });
    yield fixtures.projects[0].addCollection(fixtures.collections[0]);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield api.collections(fixtures.collections[0].id).dirs.get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when collection is not found', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).collections(1993).dirs.get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have read permission', function *() {
    var user = fixtures.users[1];
    var collection = fixtures.collections[0];
    try {
      yield api.$auth(user.email, user.password).collections(collection.id).dirs.get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return the collection\'s dirs', function *() {
    var user = fixtures.users[0];
    var collection = fixtures.collections[0];
    yield fixtures.collections[0].addDocs(fixtures.docs.slice(0, 4));
    yield fixtures.docs[1].setParent(fixtures.docs[0].UUID);
    yield fixtures.docs[2].setParent(fixtures.docs[0].UUID);
    yield fixtures.docs[3].setParent(fixtures.docs[2].UUID);
    var dirs = yield api.$auth(user.email, user.password).collections(collection.id).dirs.get();
    expect(dirs).to.have.length(1);
    expect(dirs[0].children).to.have.length(2);
  });
});
