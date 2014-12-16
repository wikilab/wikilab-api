describe('Model.Collection', function() {
  beforeEach(function *() {
    yield fixtures.load(['docs', 'collections']);
  });

  describe.only('#getDirs()', function() {
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
      yield docs[2].setOrder(0);
      yield docs[3].setOrder(1);
      yield docs[4].setOrder(2);
      yield docs[5].setOrder(3);

      var dirs = yield collection.getDirs();
      expect(dirs).to.be.instanceof(Array);
      expect(dirs).to.have.length(1);
      expect(dirs[0].UUID).to.eql(parentDoc.UUID);
      expect(dirs[0].children).to.have.length(1);
      expect(dirs[0].children[0].UUID).to.eql(docs[1].UUID);
      expect(dirs[0].children[0].children).to.have.length(4);
      expect(dirs[0].children[0].children[0].UUID).to.eql(docs[2].UUID);
      expect(dirs[0].children[0].children[1].UUID).to.eql(docs[3].UUID);
      expect(dirs[0].children[0].children[2].UUID).to.eql(docs[4].UUID);
      expect(dirs[0].children[0].children[3].UUID).to.eql(docs[5].UUID);
    });
  });
});
