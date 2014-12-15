var Sequelize = require('sequelize');
var inflection = require('inflection');
var co =  require('co');

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
    if (definition.length >= 3) {
      var funcDefinition = definition[2];
      ['hooks', 'instanceMethods', 'classMethods'].forEach(function(property) {
        var obj = funcDefinition[property];
        if (!obj) {
          return;
        }
        Object.keys(obj).forEach(function(key) {
          if (typeof obj[key] === 'function' && obj[key].constructor && obj[key].constructor.name === 'GeneratorFunction') {
            obj[key] = co.wrap(obj[key]);
          }
        });
      });
    }
    var isMySQL = sequelize.options.dialect === 'mysql';
    DataTypes.LONGTEXT = isMySQL ? 'LONGTEXT' : 'TEXT';
    return sequelize.define.apply(sequelize, definition);
  });
  self[modelName] = modelInstance;
});

self.User.hasMany(self.Team, { constraints: false });
self.Team.hasMany(self.User, { constraints: false });

self.Project.hasMany(self.Team, { through: self.ProjectTeam, constraints: false });
self.Team.hasMany(self.Project, { through: self.ProjectTeam, constraints: false });

self.Collection.hasMany(self.Doc, { constraints: false });
self.Doc.belongsTo(self.Collection, { constraints: false });

self.Project.hasMany(self.Collection, { constraints: false });
self.Collection.belongsTo(self.Project, { constraints: false });

self.sequelize = self.DB = sequelize;
