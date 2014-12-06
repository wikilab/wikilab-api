var bcrypt = require('bcrypt');

module.exports = function(DataTypes) {
  return [{
    email:    {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
      beforeCreate: function(user, fn) {
        bcrypt.hash(user.password, $config.bcryptRound, function(err, hash) {
          user.password = hash;
          fn(null, user);
        });
      }
    },
    instanceMethods: {
      comparePassword: function(password) {
        return new Promise(function(resolve, reject) {
          bcrypt.compare(password, this.password, function(err, res) {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      },
      updatePassword: function(password) {
        var hashPassword = new Promise(function(resolve, reject) {
          bcrypt.hash(user.password, $config.bcryptRound, function(err, hash) {
            if (err) {
              reject(err);
            } else {
              resolve(hash);
            }
          });
        });
        return hashPassword.then(function(hash) {
          user.password = hash;
          return user.save();
        });
      }
    }
  }];
};
