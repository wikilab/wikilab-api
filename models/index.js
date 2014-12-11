var Sequelize = require('sequelize');

var inflection = require('inflection');

$config.database.logging = $config.database.log ? console.log : false;
var sequelize = new Sequelize($config.database.name,
                              $config.database.user,
                              $config.database.pass,
                              $config.database);

var self = module.exports = {};

var models = require('node-require-directory')(__dirname);
Object.keys(models).forEach(function(key) {
  var modelName = inflection.classify(key);
  var modelInstance = sequelize.import(modelName , function(sequelize, DataTypes) {
    var definition = [modelName].concat(models[key](DataTypes));
    if (sequelize.options.dialect === 'mysql') {
      DataTypes.LONGTEXT = 'LONGTEXT';
    } else {
      DataTypes.LONGTEXT = 'TEXT';
    }
    return sequelize.define.apply(sequelize, definition);
  });
  self[modelName] = modelInstance;
});

self.User.hasMany(self.Team, { constraints: false });
self.Team.hasMany(self.User, { constraints: false });

self.Project.hasMany(self.Team, { through: self.ProjectTeam, constraints: false });
self.Team.hasMany(self.Project, { through: self.ProjectTeam, constraints: false });

self.Collection.hasMany(self.Doc);
self.Doc.belongsTo(self.Collection);

self.sequelize = self.DB = sequelize;
