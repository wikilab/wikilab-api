module.exports = function(DataTypes) {
  return [{
    key:    {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      set: function *(key, value) {
        value = JSON.stringify(value);
        var pair = (yield this.findOrCreate({
          where: { key: key },
          defaults: { value: value }
        }))[0];
        if (pair.value !== value) {
          pair.value = value;
          yield pair.save();
        }
        return pair;
      },
      get: function *(key, defaults) {
        var pair = yield this.find({ where: { key: key } });
        if (pair) {
          return JSON.parse(pair.value);
        }
        if (typeof defaults !== 'undefined') {
          return defaults;
        }
      }
    }
  }, {
    timestamps: false
  }];
};
