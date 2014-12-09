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
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  }).catch(function(err) {
    console.error(err.stack);
  });
};

exports.unload = function() {
  if (sequelize.options.dialect === 'mysql') {
    return sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(function() {
      return sequelize.sync({ force: true });
    }).then(function() {
      return sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    });
  } else {
    return sequelize.sync({ force: true });
  }
};
