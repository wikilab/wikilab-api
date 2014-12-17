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
    isOwner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: true,
    updatedAt: false,
    hooks: {
      beforeCreate: function *(user) {
        if ($config.bcryptRound) {
          user.password = yield bcrypt.hash(user.password, $config.bcryptRound);
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
      comparePassword: function *(password) {
        if ($config.bcryptRound) {
          return yield bcrypt.compare(password, this.password);
        }
        return this.password === password;
      },
      updatePassword: function *(newPassword) {
        var hashPassword;
        if ($config.bcryptRound) {
          hashPassword = yield bcrypt.hash(newPassword, $config.bcryptRound);
        } else {
          hashPassword = newPassword;
        }
        this.password = hashPassword ;
        return yield this.save(['password']);
      },
      getPermission: function *(project) {
        if (this.isOwner) {
          return 'admin';
        }
        var teams = yield this.getTeams({ attributes: ['id'] });
        var teamIds = teams.map(function(team) {
          return team.id;
        });
        teams = yield project.getTeams({ where: { id: teamIds }, attributes: [] });
        var highestPermission = null;
        teams.forEach(function(team) {
          var permission = team.ProjectTeam.permission;
          highestPermission = ProjectTeam.higherPermission(highestPermission, permission);
        });
        return highestPermission;
      },
      havePermission: function *(project, expectedPermission) {
        var permission = yield this.getPermission(project);
        return ProjectTeam.higherPermission(permission, expectedPermission) === permission;
      }
    }
  }];
};
