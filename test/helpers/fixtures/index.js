var fixtures = require('node-require-directory')(__dirname);

exports.load = function(specificFixtures) {
  return exports.unload().then(function() {
    if (typeof specificFixtures === 'string') {
      specificFixtures = [specificFixtures];
    }
    var promises = [];
    Object.keys(fixtures).filter(function(key) {
      if (key === 'index') {
        return false;
      }
      if (specificFixtures && specificFixtures.indexOf(key) === -1) {
        return false;
      }
      return true;
    }).forEach(function(key) {
      var promise = fixtures[key].load().then(function(instances) {
        exports[key] = instances;
      }).catch(function(e) {
        console.error('Load fixtures', e);
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  });
};

exports.unload = function() {
  return sequelize.sync({ force: true });
};
