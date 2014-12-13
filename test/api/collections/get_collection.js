describe('GET /collections/:collectionId', function() {
  beforeEach(function() {
    return fixtures.load().then(function() {
      return Promise.all([
        fixtures.users[0].addTeam(fixtures.teams[0]),
        fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'read' }),
        fixtures.projects[0].addCollection(fixtures.collections[0]),
        fixtures.collections[0].addDocs(fixtures.docs),
        fixtures.docs[1].setParent(fixtures.docs[0].UUID),
        fixtures.docs[2].setParent(fixtures.docs[0].UUID),
        fixtures.docs[3].setParent(fixtures.docs[2].UUID)
      ]);
    });
  });

  it('should return 404 when collection is not found', function() {
    var user = fixtures.users[0];
    return api.$auth(user.email, user.password).collections(1993).get().then(function() {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(404);
    });
  });

  it('should return 403 when the user don\'t have read permission', function() {
    var user = fixtures.users[1];
    var collection = fixtures.collections[0];
    return api.$auth(user.email, user.password).collections(collection.id).get().then(function() {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.statusCode).to.eql(403);
    });
  });

  it('should return the collection with it\'s project', function() {
    var user = fixtures.users[0];
    var project = fixtures.projects[0];
    var collection = fixtures.collections[0];
    return api.$auth(user.email, user.password).collections(collection.id).get().then(function(returnedCollection) {
      expect(returnedCollection).to.have.property('id', collection.id);
      expect(returnedCollection).to.have.property('name', collection.name);
      expect(returnedCollection.project).to.have.property('id', project.id);
    });
  });

  it('should contain doc tree');
});
