exports.load = function *() {
  return [
    yield News.create({
      type: 'collection.create',
    }),
    yield News.create({
      type: 'doc.create'
    }),
    yield News.create({
      type: 'doc.destroy'
    }),
    yield News.create({
      type: 'doc.update'
    })
  ];
};
