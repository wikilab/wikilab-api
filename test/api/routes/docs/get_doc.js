describe('GET /docs/:docUUID', function() {
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
      yield API.docs(this.doc.UUID).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when doc is not found', function *() {
    try {
      yield API.$auth(this.reader.email, this.reader.password).docs('not exists UUID').get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have read permission', function *() {
    var guest = fixtures.users[2];
    try {
      yield API.$auth(guest.email, guest.password).docs(this.doc.UUID).get();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return the current version', function *() {
    yield Doc.createWithTransaction({
      UUID: this.doc.UUID,
      CollectionId: this.doc.CollectionId,
      title: 'new title',
      content: 'new content'
    });
    var doc = yield API.$auth(this.reader.email, this.reader.password).docs(this.doc.UUID).get();
    expect(doc.title).to.eql('new title');
    expect(doc.content).to.eql('new content');
    expect(doc.current).to.eql(true);
    expect(doc.UUID).to.eql(this.doc.UUID);
  });

  describe('?version=:version', function() {
    it('should return the specified version', function *() {
      var version1 = yield Doc.createWithTransaction({
        UUID: this.doc.UUID,
        CollectionId: this.doc.CollectionId,
        title: 'version1',
        content: 'version 1'
      });
      var version2 = yield Doc.createWithTransaction({
        UUID: this.doc.UUID,
        CollectionId: this.doc.CollectionId,
        title: 'version2',
        content: 'version 2'
      });
    var doc = yield API.$auth(this.reader.email, this.reader.password).docs(this.doc.UUID).get({
      version: version1.version
    });
    expect(doc.title).to.eql(version1.title);
    expect(doc.content).to.eql(version1.content);
    expect(doc.version).to.eql(version1.version);
    });
  });
});
