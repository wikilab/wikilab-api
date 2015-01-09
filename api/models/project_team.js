module.exports = function(DataTypes) {
  var PERMISSION = {
    read: 4,
    write: 2,
    admin: 1
  };
  return [{
    permission: {
      type: DataTypes.ENUM.apply(DataTypes, Object.keys(PERMISSION)),
      allowNull: false
    }
  }, {
    timestamps: false,
    classMethods: {
      higherPermission: function() {
        var permissions = Array.prototype.slice.call(arguments);
        var min = Math.min.apply(Math, permissions.map(function(permission) {
          return PERMISSION[permission] || Number.MAX_VALUE;
        }));
        return Object.keys(PERMISSION).find(function(key) {
          return PERMISSION[key] === min;
        });
      }
    }
  }];
};
