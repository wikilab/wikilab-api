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
    distance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    }
  }, {
    beforeCreate: function(doc, _, fn) {
      Doc.find({
        where: { UUID: doc.UUID, type: 'current' },
        attributes: ['content']
      }).then(function(prevDoc) {
        if (!prevDoc) {
          return fn(null, prevDoc);
        }
        var similarity = natural.JaroWinklerDistance(doc.content, prevDoc);
        doc.distance = Math.round((1 - similarity) * 100);
        fn(null, doc);
      });
    }
  }];
};
