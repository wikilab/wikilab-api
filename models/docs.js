var natural = require('natural');
var Instance = require('../node_modules/sequelize/lib/instance.js');

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
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
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
    },
    order: {
      type: DataTypes.INTEGER
    }
  }, {
    timestamps: true,
    updatedAt: false,
    hooks: {
      beforeUpdate: function *(doc, options) {
        if (options.fields.indexOf('parentUUID') !== -1 && !options.transaction) {
          throw new Error('Updating the parentUUID should within a transaction');
        }
        var intrinsicProperties = ['title', 'content'];
        if (_.intersection(options.fields, intrinsicProperties).length) {
          throw new Error('Can\'t update intrinsic properties');
        }
      }
    },
    classMethods: {
      createWithTransaction: function *(doc) {
        if (!doc.CollectionId) {
          throw new Error('CollectionId is not specified');
        }
        var t = yield sequelize.transaction();
        try {
          if (doc.parentUUID) {
            yield checkParent(doc.parentUUID, doc.CollectionId, t);
          }
          var prevDoc = yield Doc.find({
            where: { UUID: doc.UUID, current: true },
            attributes: ['id', 'content', 'current', 'version', 'title']
          }, {
            transaction: t,
            lock: t.LOCK.UPDATE
          });
          if (prevDoc) {
            doc.distance = natural.LevenshteinDistance(doc.content, prevDoc.content) +
                           natural.LevenshteinDistance(doc.title, prevDoc.title);
            doc.version = prevDoc.version + 1;
            yield prevDoc.updateAttributes({ current: false }, { fields: ['current'], silent: true, transaction: t });
          }
          var createdDoc = yield this.create(doc, { transaction: t });
          t.commit();
          return createdDoc ;
        } catch (err) {
          t.rollback();
          throw err;
        }
      }
    },
    instanceMethods: {
      toJSON: function() {
        var ret = Instance.prototype.toJSON.call(this);
        delete ret.id;
        return ret;
      },
      setParent: function *(parentUUID) {
        var t = yield sequelize.transaction();
        try {
          yield checkParent(parentUUID, this.CollectionId, t);
          yield this.updateAttributes({ parentUUID: parentUUID }, { transaction: t, silent: true });
          t.commit();
        } catch (err) {
          t.rollback();
          throw err;
        }
      },
      setOrder: function *(order) {
        var t = yield sequelize.transaction();
        try {
          var docs = yield Doc.findAll({
            where: { parentUUID: this.parentUUID },
            attributes: ['id', 'order', 'createdAt']
          }, {
            transaction: t,
            lock: t.LOCK.UPDATE
          });
          docs.sort(function(a, b) {
            if (typeof a.order === 'number' && typeof b.order === 'number') {
              return a.order - b.order;
            } else {
              return a.createdAt - b.createdAt;
            }
          });
          var thisInstance, i;
          for (i = 0; i < docs.length; ++i) {
            if (docs[i].id === this.id) {
              thisInstance = docs[i];
              docs.splice(i, 1);
              break;
            }
          }
          docs.splice(order, 0, thisInstance);
          for (i = 0; i < docs.length; ++i) {
            if (docs[i].order !== i) {
              yield docs[i].updateAttributes({ order: i }, { transaction: t, silent: true });
            }
          }
          t.commit();
        } catch (err) {
          t.rollback();
          throw err;
        }
      }
    }
  }];
};

function checkParent(parentUUID, collectionId, t) {
  return Doc.find({
    where: { UUID: parentUUID },
    attributes: ['UUID', 'CollectionId']
  }, {
    transaction: t,
    lock: t.LOCK.UPDATE
  }).then(function(parentDoc) {
    if (!parentDoc) {
      throw new Error('Parent document not exists');
    }
    if (parentDoc.CollectionId !== collectionId) {
      throw new Error('Parent document should belong to the same collection');
    }
  });
}
