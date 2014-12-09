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
      beforeCreate: function(doc, _, fn) {
        Doc.find({
          where: { UUID: doc.UUID, current: true },
          attributes: ['id', 'content', 'current']
        }).then(function(prevDoc) {
          if (!prevDoc) {
            return fn(null, prevDoc);
          }
          doc.distance = natural.LevenshteinDistance(doc.content, prevDoc.content);
          prevDoc.updateAttributes({ current: false }, ['current']).then(function(e) {
            fn(null, doc);
          }).catch(function(e) {
            fn(e);
          });
        });
      }
    }
  }];
};
