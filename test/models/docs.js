var uuid = require('node-uuid').v4;

describe('Model.Doc', function() {
  beforeEach(function *() {
    yield fixtures.load(['docs', 'collections']);
  });

  it('should reject when update parentUUID outside a transaction', function() {
    var doc = fixtures.docs[0];
    var oldParentUUID = doc.parentUUID;
    return doc.updateAttributes({ parentUUID: uuid() }).then(function() {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err.message).to.eql('Updating the parentUUID should within a transaction');
    });
  });

  it('should update successfully when parentUUID is not touched', function() {
    var doc = fixtures.docs[0];
    doc.title = 'updated doc';
    return doc.save();
  });

  describe('.createWithTransaction()', function() {
    it('should reject is CollectionId is not specified', function() {
      return Doc.createWithTransaction({
        title: 'new doc',
        content: 'new content'
      }).then(function(doc) {
        throw new Error('should reject');
      }).catch(function(err) {
        expect(err.message).to.eql('CollectionId is not specified');
      });
    });

    it('should have a default UUID and null parentUUID', function() {
      return Doc.createWithTransaction({
        title: 'new doc',
        content: 'new content',
        CollectionId: fixtures.collections[0].id
      }).then(function(doc) {
        expect(doc).to.have.property('UUID');
        /* jshint expr:true */
        expect(doc.parentUUID).to.not.exist;
      });
    });

    it('should mark the previous version inactive', function() {
      var oldDoc = fixtures.docs[0];
      var newDoc;
      return Doc.createWithTransaction({
        UUID: oldDoc.UUID,
        title: 'new title',
        content: 'new content',
        CollectionId: fixtures.collections[0].id
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
        content: '',
        CollectionId: fixtures.collections[0].id
      }).then(function(doc) {
        expect(doc.distance).to.eql(oldDoc.content.length);
      });
    });

    it('should reject when the parentUUID not exists', function() {
      return Doc.createWithTransaction({
        title: 'new title',
        content: '',
        parentUUID: uuid(),
        CollectionId: fixtures.collections[0].id
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
        content: 'new content',
        CollectionId: fixtures.collections[0].id
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

  describe('#setParent()', function() {
    it('should update the parent of document', function *() {
      var doc = fixtures.docs[0];
      var parentDoc = fixtures.docs[1];
      yield fixtures.collections[0].addDocs([doc, parentDoc]);
      yield doc.setParent(parentDoc.UUID);
      expect(yield doc.reload()).to.have.property('parentUUID', parentDoc.UUID);
    });

    it('should rollback when creation fails', function *() {
      var doc = fixtures.docs[0];
      var previousParentUUID = doc.parentUUID;
      var parentDoc = fixtures.docs[1];
      yield fixtures.collections[0].addDocs([doc, parentDoc]);
      sinon.stub(doc, 'save', function() {
        throw new Error('reject');
      });
      try {
        yield doc.setParent(parentDoc.UUID);
        throw new Error('should reject');
      } catch (err) {
        expect(err.message).to.eql('reject');
        expect(yield doc.reload()).to.have.property('parentUUID', previousParentUUID);
      }
    });
  });

  describe('#setOrder()', function() {
    it('should update the order of document', function *() {
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
      yield docs[4].setOrder(1);
      var subDocs = yield Doc.findAll({
        where: { parentUUID: docs[1].UUID },
        order: '`order` ASC'
      });
      expect(subDocs.map(function(doc) { return doc.id; })).to.eql([3, 5, 4, 6]);
    });
  });
});
