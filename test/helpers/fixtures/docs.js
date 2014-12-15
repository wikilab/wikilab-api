exports.load = function *() {
  return [
    yield Doc.create({
      title: 'title0',
      content: 'content0',
      hierarchyLevel: 1
    }),
    yield Doc.create({
      title: 'title1',
      content: 'content1'
    }),
    yield Doc.create({
      title: 'title2',
      content: 'content2'
    }),
    yield Doc.create({
      title: 'title3',
      content: 'content3'
    }),
    yield Doc.create({
      title: 'title4',
      content: 'content4'
    }),
    yield Doc.create({
      title: 'title5',
      content: 'content5'
    })
  ];
};
