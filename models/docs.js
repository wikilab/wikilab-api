var natural = require('natural');

module.exports = function(DataTypes) {
  return [{
    UUID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        isUUID: 4
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.LONGTEXT,
      allowNull: false
    },
    current: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    distance: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    hooks: {
      beforeCreate: function(doc) {
        return Doc.find({
          where: { UUID: doc.UUID, current: true },
          attributes: ['id', 'content', 'current']
        }).then(function(prevDoc) {
          if (!prevDoc) {
            return;
          }
          doc.distance = natural.LevenshteinDistance(doc.content, prevDoc.content);
          return prevDoc.updateAttributes({ current: false }, ['current']);
        });
      }
    }
  }];
};
