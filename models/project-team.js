module.exports = function(DataTypes) {
  return [{
    permission: {
      type: DataTypes.ENUM('read', 'write', 'admin'),
      allowNull: false
    }
  }];
};
