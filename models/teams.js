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
  }];
};
