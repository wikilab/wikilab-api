var promisify = require('promisify-node');
var bcrypt = promisify('bcrypt');
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
        if ($config.bcryptRound) {
          return bcrypt.hash(user.password, $config.bcryptRound).then(function(hash) {
            user.password = hash;
          });
        }
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
        if ($config.bcryptRound) {
          return bcrypt.compare(password, this.password);
        }
        return Promise.resolve(this.password === password);
      },
      updatePassword: function(newPassword) {
        var hashPassword;
        if ($config.bcryptRound) {
          hashPassword = bcrypt.hash(newPassword, $config.bcryptRound);
        } else {
          hashPassword = Promise.resolve(newPassword);
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
