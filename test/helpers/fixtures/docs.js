exports.load = function() {
  var docs = [
    Doc.build({
      title: 'title0',
      content: 'content0',
      hierarchyLevel: 1
    }),
    Doc.build({
      title: 'title1',
      content: 'content1'
    }),
    Doc.build({
      title: 'title2',
      content: 'content2'
    }),
    Doc.build({
      title: 'title3',
      content: 'content3'
    }),
    Doc.build({
      title: 'title4',
      content: 'content4'
    }),
    Doc.build({
      title: 'title5',
      content: 'content5'
    })
  ];

  return Promise.all(docs.map(function(doc) {
    return doc.save();
  }));
};
