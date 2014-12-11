exports.load = function() {
  var collections = [
    Collection.build({
      name: 'collection0',
    }),
    Collection.build({
      name: 'collection1'
    })
  ];

  return Promise.all(collections.map(function(collection) {
    return collection.save();
  }));
};
