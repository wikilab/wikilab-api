var TreeModel = require('tree-model');

module.exports = function(DataTypes) {
  return [{
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }];
};
