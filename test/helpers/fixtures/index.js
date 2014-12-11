var fixtures = require('node-require-directory')(__dirname);

exports.load = function(specificFixtures) {
  if (typeof specificFixtures === 'string') {
    specificFixtures = [specificFixtures];
  }
  return exports.unload(specificFixtures).then(function() {
    var promises = [];
    Object.keys(fixtures).filter(function(key) {
      if (specificFixtures && specificFixtures.indexOf(key) === -1) {
        return false;
      }
      return true;
    }).forEach(function(key) {
      var promise = fixtures[key].load().then(function(instances) {
        exports[key] = instances;
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  }).catch(function(err) {
    console.error(err);
    process.exit(1);
  });
};

exports.unload = function(specificFixtures) {
  return sequelize.sync({ force: true });
};
