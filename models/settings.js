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
      set: function(key, value) {
        value = JSON.stringify(value);
        return this.findOrCreate({
          where: { key: key },
          defaults: { value: value }
        }).spread(function(instance, isNew) {
          if (!isNew && instance.value !== value) {
            instance.value = value;
            return instance.save();
          }
          return instance;
        });
      },
      get: function(key, defaults) {
        return this.find({ where: { key: key } }).then(function(instance) {
          if (instance) {
            return JSON.parse(instance.value);
          }
          if (typeof defaults !== 'undefined') {
            return defaults;
          }
        });
      }
    }
  }, {
    timestamps: false
  }];
};
