var bcrypt = require('bcrypt');
var Instance = require('../node_modules/sequelize/lib/instance.js');

module.exports = function(DataTypes) {
  return [{
    email:    {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCreate: function(user) {
        if (!$config.bcryptRound) {
          return;
        }
        return new Promise(function(resolve, reject) {
          bcrypt.hash(user.password, $config.bcryptRound, function(err, hash) {
            if (err) {
              return reject(err);
            }
            user.password = hash;
            resolve();
          });
        });
      }
    },
    instanceMethods: {
      toJSON: function() {
        // Protect password field
        // Related issue: https://github.com/sequelize/sequelize/issues/2156
        var ret = Instance.prototype.toJSON.call(this);
        delete ret.password;
        return ret;
      },
      comparePassword: function(password) {
        if (!$config.bcryptRound) {
          return Promise.resolve(this.password === password);
        }
        var currentPassword = this.password;
        return new Promise(function(resolve, reject) {
          bcrypt.compare(password, currentPassword , function(err, res) {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      },
      updatePassword: function(newPassword) {
        var hashPassword;
        if (!$config.bcryptRound) {
          hashPassword = Promise.resolve(newPassword);
        } else {
          hashPassword = new Promise(function(resolve, reject) {
            bcrypt.hash(newPassword, $config.bcryptRound, function(err, hash) {
              if (err) {
                reject(err);
              } else {
                resolve(hash);
              }
            });
          });
        }
        var _this = this;
        return hashPassword.then(function(hash) {
          _this.password = hash;
          return _this.save(['password']);
        });
      },
      havePermission: function(project, level) {
        return this.getTeams({ attributes: ['id'] }).then(function(teams) {
          var teamIds = teams.map(function(team) {
            return team.id;
          });
          return project.getTeams({
            where: { id: teamIds },
            attributes: []
          }).then(function(teams) {
            return teams.some(function(team) {
              var permission = team.ProjectTeam.permission;
              return ProjectTeam.higherPermission(permission, level) === permission;
            });
          });
        });
      }
    }
  }];
};
