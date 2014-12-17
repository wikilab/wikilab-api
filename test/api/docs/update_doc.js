describe('PATCH /docs/:docUUID', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.writer = fixtures.users[1];
    this.reader = fixtures.users[2];
    yield this.writer.addTeam(fixtures.teams[0]);
    yield this.reader.addTeam(fixtures.teams[1]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'write' });
    yield fixtures.teams[1].addProject(fixtures.projects[0], { permission: 'read' });
    this.collection = fixtures.collections[0];
    yield fixtures.projects[0].addCollection(this.collection);
    this.doc = fixtures.docs[0];
    yield this.collection.addDoc(this.doc);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield api.docs(this.doc.UUID).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when doc is not found', function *() {
    try {
      yield api.$auth(this.writer.email, this.writer.password).docs('not exists UUID').patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have write permission', function *() {
    try {
      yield api.$auth(this.reader.email, this.reader.password).docs(this.doc.UUID).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should update the title or content', function *() {
    var result;
    result = yield api.$auth(this.writer.email, this.writer.password).docs(this.doc.UUID).patch({
      title: this.doc.title.repeat(2)
    });
    expect(result.changedProperties).to.eql(['title']);
    expect(result.versions.previous).to.eql(this.doc.version);
    expect(result.versions.current).to.eql(this.doc.version + 1);
    expect(result.distance).to.eql(this.doc.title.length);
    result = yield api.$auth(this.writer.email, this.writer.password).docs(this.doc.UUID).patch({
      content: this.doc.content.repeat(2)
    });
    expect(result.changedProperties).to.eql(['content']);
    expect(result.versions.previous).to.eql(this.doc.version + 1);
    expect(result.versions.current).to.eql(this.doc.version + 2);
    expect(result.distance).to.eql(this.doc.content.length);
  });
});
