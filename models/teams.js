module.exports = function(DataTypes) {
  return [{
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('owner', 'user'),
      defaultValue: 'user',
      allowNull: false
    }
  }, {
    hooks: {
      beforeCreate: function(teams, _, fn) {
        if (teams.type !== 'owner') {
          return fn(null, teams);
        }
        Team.count({ where: { type: 'owner' } }).then(function(count) {
          if (count > 0) {
            fn(new Error('Owner team is existed'));
          } else {
            fn(null, teams);
          }
        });
      }
    }
  }];
};
