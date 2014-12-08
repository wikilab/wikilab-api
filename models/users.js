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
    }
  }, {
    hooks: {
      beforeCreate: function(user, _, fn) {
        if (!$config.bcryptRound) {
          return fn(null, user);
        }
        if (!user.password) {
          return fn(null, user);
        }
        bcrypt.hash(user.password, $config.bcryptRound, function(err, hash) {
          user.password = hash;
          fn(null, user);
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
      isOwner: function() {
        return this.getTeams({ where: { type: 'owner' } }).then(function(teams) {
          return teams.length > 0;
        });
      }
    }
  }];
};
