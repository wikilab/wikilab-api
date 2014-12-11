describe('Model.Doc', function() {
  beforeEach(function() {
    return fixtures.load(['docs', 'collections']);
  });

  describe('#createWithTransaction()', function() {
    it('should have a default UUID and null parentUUID', function() {
      return Doc.createWithTransaction({
        title: 'new doc',
        content: 'new content'
      }).then(function(doc) {
        expect(doc).to.have.property('UUID');
        expect(doc).to.not.have.property('parentUUID');
      });
    });

    it('should mark the previous version inactive', function() {
      var oldDoc = fixtures.docs[0];
      var newDoc;
      return Doc.createWithTransaction({
        UUID: oldDoc.UUID,
        title: 'new title',
        content: 'new content'
      }).then(function(doc) {
        newDoc = doc;
        return oldDoc.reload();
      }).then(function() {
        expect(oldDoc.current).to.eql(false);
        expect(newDoc.current).to.eql(true);
      });
    });

    it('should calculate the distance between contents', function() {
      var oldDoc = fixtures.docs[0];
      return Doc.createWithTransaction({
        UUID: oldDoc.UUID,
        title: 'new title',
        content: ''
      }).then(function(doc) {
        expect(doc.distance).to.eql(oldDoc.content.length);
      });
    });

    it('should reject when the parentUUID not exists', function() {
      return Doc.createWithTransaction({
        title: 'new title',
        content: '',
        parentUUID: 'not exists'
      }).then(function() {
        throw new Error('should reject');
      }).catch(function(err) {
        expect(err).to.have.property('message', 'Parent document not exists');
      });
    });

    it('should reject when the parentUUID belong another collection', function() {
      var collections = fixtures.collections;
      var docs = fixtures.docs;
      return collections[0].addDoc(docs[0]).then(function() {
        return Doc.createWithTransaction({
          title: 'new title',
          content: '',
          CollectionId: collections[1].id,
          parentUUID: docs[0].UUID
        });
      }).then(function() {
        throw new Error('should reject');
      }).catch(function(err) {
        expect(err).to.have.property('message', 'Parent document should belong to the same collection');
      });
    });

    it('should create the instance with parentUUID being set', function() {
      var collections = fixtures.collections;
      var docs = fixtures.docs;
      return collections[0].addDoc(docs[0]).then(function() {
        return Doc.createWithTransaction({
          title: 'new title',
          content: '',
          CollectionId: collections[0].id,
          parentUUID: docs[0].UUID
        });
      }).then(function(doc) {
        expect(doc.parentUUID).to.eql(docs[0].UUID);
      });
    });

    it('should rollback when creation fails', function() {
      sinon.stub(Doc, 'create', function() {
        return Promise.reject(new Error('reject'));
      });

      var oldDoc = fixtures.docs[0];
      var newDoc;
      return Doc.createWithTransaction({
        UUID: oldDoc.UUID,
        title: 'new title',
        content: 'new content'
      }).then(function() {
        throw new Error('should reject');
      }).catch(function(err) {
        expect(err.message).to.eql('reject');
        return oldDoc.reload().then(function() {
          expect(oldDoc.current).to.eql(true);
          Doc.create.restore();
        });
      });
    });
  });
});
