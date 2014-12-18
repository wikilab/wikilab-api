describe('GET /docs/:docUUID/versions', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.reader = fixtures.users[1];
    yield this.reader.addTeam(fixtures.teams[0]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'read' });
    this.collection = fixtures.collections[0];
    yield fixtures.projects[0].addCollection(this.collection);
    this.doc = fixtures.docs[0];
    yield this.collection.addDoc(this.doc);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield api.docs(this.doc.UUID).versions.get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when doc is not found', function *() {
    try {
      yield api.$auth(this.reader.email, this.reader.password).docs('not exists UUID').versions.get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have read permission', function *() {
    var guest = fixtures.users[2];
    try {
      yield api.$auth(guest.email, guest.password).docs(this.doc.UUID).versions.get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return the version list', function *() {
    var newDoc = yield Doc.createWithTransaction({
      UUID: this.doc.UUID,
      CollectionId: this.doc.CollectionId,
      title: 'new title',
      content: 'new content'
    });
    var versions = yield api.$auth(this.reader.email, this.reader.password).docs(this.doc.UUID).versions.get();
    expect(versions).to.have.length(2);
    expect(versions[0]).to.have.property('version', 1);
    expect(versions[0]).to.not.have.property('title');
    expect(versions[0]).to.not.have.property('content');
    expect(versions[1]).to.have.property('version', 2);
    expect(versions[1]).to.have.property('distance', newDoc.distance);
  });

  describe('?fields=title,author,content', function() {
    it('should also return the specified fields', function *() {
      var version = (yield api.$auth(this.reader.email, this.reader.password).docs(this.doc.UUID).versions.get({
        fields: 'title,author,content'
      }))[0];
      expect(version.title).to.eql(this.doc.title);
      expect(version.content).to.eql(this.doc.content);
      expect(version).to.have.property('author');
    });
  });
});
