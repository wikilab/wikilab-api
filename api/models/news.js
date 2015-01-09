module.exports = function(DataTypes) {
  return [{
    type: {
      type: DataTypes.ENUM(
        // Collection
        'collection.create',
        'collection.destroy',
        // Doc
        'doc.create',
        'doc.rename',
        'doc.update',
        'doc.destroy'
      ),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    DocUUID: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      }
    }
  }, {
    timestamps: true,
    updatedAt: false
  }];
};
