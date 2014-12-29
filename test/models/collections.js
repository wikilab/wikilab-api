describe('Model.Collection', function() {
  beforeEach(function *() {
    yield fixtures.load(['docs', 'collections', 'projects']);
  });

  describe('#getDirs()', function() {
    it('should return the dirs of the docs', function *() {
      var collection = fixtures.collections[0];
      var docs = fixtures.docs;
      yield collection.addDocs(fixtures.docs);
      var parentDoc = docs[0];
      yield docs[1].setParent(parentDoc.UUID);
      yield docs[2].setParent(docs[1].UUID);
      yield docs[3].setParent(docs[1].UUID);
      yield docs[4].setParent(docs[1].UUID);
      yield docs[5].setParent(docs[1].UUID);
      yield docs[5].setOrder(0);
      yield docs[4].setOrder(1);
      yield docs[3].setOrder(2);
      yield docs[2].setOrder(3);

      var dirs = yield collection.getDirs();
      expect(dirs).to.be.instanceof(Array);
      expect(dirs).to.have.length(1);
      expect(dirs[0].UUID).to.eql(parentDoc.UUID);
      expect(dirs[0].children).to.have.length(1);
      expect(dirs[0].children[0].UUID).to.eql(docs[1].UUID);
      expect(dirs[0].children[0].children).to.have.length(4);
      expect(dirs[0].children[0].children[0].UUID).to.eql(docs[5].UUID);
      expect(dirs[0].children[0].children[1].UUID).to.eql(docs[4].UUID);
      expect(dirs[0].children[0].children[2].UUID).to.eql(docs[3].UUID);
      expect(dirs[0].children[0].children[3].UUID).to.eql(docs[2].UUID);
    });
  });

  describe('#setOrder()', function() {
    it('should set the order', function *() {
      var collections = fixtures.collections;
      var project = fixtures.projects[0];
      yield project.addCollections([collections[0], collections[1], collections[2]]);
      var i;

      yield collections[1].setOrder(0);
      for (i = 0; i < 4; ++i) {
        yield collections[i].reload();
      }
      expect(collections[0]).to.have.property('order', 1);
      expect(collections[1]).to.have.property('order', 0);
      expect(collections[2]).to.have.property('order', 2);
      expect(collections[3]).to.have.property('order', null);

      yield collections[2].setOrder(1);
      for (i = 0; i < 4; ++i) {
        yield collections[i].reload();
      }
      expect(collections[0]).to.have.property('order', 2);
      expect(collections[1]).to.have.property('order', 0);
      expect(collections[2]).to.have.property('order', 1);
      expect(collections[3]).to.have.property('order', null);
    });
  });
});
