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
    },
    parentUUID: {
      type: DataTypes.UUID,
      validate: {
        isUUID: 4
      }
    }
  }, {
    classMethods: {
      createWithTransaction: function(doc) {
        var _this = this;
        return sequelize.transaction().then(function(t) {
          var promise = Promise.resolve();
          if (doc.parentUUID) {
            promise = promise.then(function() {
              return Doc.find({
                where: { UUID: doc.parentUUID },
                attributes: ['UUID', 'CollectionId']
              }, {
                transaction: t,
                lock: t.LOCK.UPDATE
              }).then(function(parentDoc) {
                if (!parentDoc) {
                  throw new Error('Parent document not exists');
                }
                if (parentDoc.CollectionId !== doc.CollectionId) {
                  throw new Error('Parent document should belong to the same collection');
                }
              });
            });
          }
          promise = promise.then(function() {
            return Doc.find({
              where: { UUID: doc.UUID, current: true },
              attributes: ['id', 'content', 'current']
            }, {
              transaction: t,
              lock: t.LOCK.UPDATE
            }).then(function(prevDoc) {
              if (prevDoc) {
                doc.distance = natural.LevenshteinDistance(doc.content, prevDoc.content);
                return prevDoc.updateAttributes({
                  current: false
                }, {
                  fields: ['current'],
                  silent: true,
                  transaction: t
                });
              }
            });
          });
          return promise.then(function() {
            return _this.create(doc, { transaction: t });
          }).then(function(doc) {
            t.commit();
            return doc;
          }).catch(function(err) {
            t.rollback();
            throw err;
          });
        });
      }
    }
  }];
};
