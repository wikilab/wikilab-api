var fixtures = require('node-require-directory')(__dirname);

exports.load = function *(specificFixtures) {
  if (typeof specificFixtures === 'string') {
    specificFixtures = [specificFixtures];
  }

  var prevSetting = sequelize.options.logging;
  sequelize.options.logging = false;
  try {
    yield exports.unload();

    var keys = Object.keys(fixtures).filter(function(key) {
      if (specificFixtures && specificFixtures.indexOf(key) === -1) {
        return false;
      }
      return true;
    });
    for (var i = 0; i < keys.length; ++i) {
      exports[keys[i]] = yield fixtures[keys[i]].load();
    }
  } catch (e) {
    console.error(e);
  }
  sequelize.options.logging = prevSetting;
};

exports.unload = function *() {
  var prevSetting = sequelize.options.logging;
  sequelize.options.logging = false;
  yield sequelize.sync({ force: true });
  sequelize.options.logging = prevSetting;
};
