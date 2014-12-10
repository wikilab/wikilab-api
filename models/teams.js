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
      beforeCreate: function(teams) {
        if (teams.type !== 'owner') {
          return;
        }
        return Team.count({ where: { type: 'owner' } }).then(function(count) {
          if (count > 0) {
            throw new Error('Owner team is existed');
          }
        });
      }
    }
  }];
};
