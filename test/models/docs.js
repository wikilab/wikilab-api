describe('Model.Doc', function() {
  beforeEach(function() {
    return fixtures.load('docs');
  });

  it('should have a default UUID', function() {
    return expect(Doc.create({
      title: 'new doc',
      content: 'new content'
    })).to.eventually.have.property('UUID');
  });

  it('should mark the previous version inactive', function() {
    var oldDoc = fixtures.docs[0];
    var newDoc;
    return Doc.create({
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
    return Doc.create({
      UUID: oldDoc.UUID,
      title: 'new title',
      content: ''
    }).then(function(doc) {
      expect(doc.distance).to.eql(oldDoc.content.length);
    });
  });
});
