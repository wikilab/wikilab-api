exports.load = function *() {
  return [
    yield Collection.create({
      name: 'collection0',
    }),
    yield Collection.create({
      name: 'collection1'
    }),
    yield Collection.create({
      name: 'collection2'
    }),
    yield Collection.create({
      name: 'collection3'
    })
  ];
};
