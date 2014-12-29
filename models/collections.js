module.exports = function(DataTypes) {
  return [{
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER
    }
  }, {
    timestamps: true,
    updatedAt: false,
    instanceMethods: {
      getDirs: function *() {
        var docs = yield this.getDocs({ attributes: ['UUID', 'parentUUID', 'title', 'order'] });
        docs = docs.map(function(doc) {
          doc = doc.dataValues;
          doc.children = [];
          return doc;
        });

        var idMapper = {};
        docs.forEach(function(doc) {
          idMapper[doc.UUID] = doc;
        });

        docs.forEach(function(doc) {
          if (doc.parentUUID) {
            idMapper[doc.parentUUID].children.push(doc);
            doc.isChild = true;
          }
        });
        var dirs = [];
        Object.keys(idMapper).forEach(function(key) {
          if (!idMapper[key].isChild) {
            dirs.push(idMapper[key]);
          }
        });
        return removeUnnessaryPropertiesAndSort(dirs);
      },
      setOrder: function *(order) {
        var t = yield sequelize.transaction();
        try {
          var collections = yield Collection.findAll({
            where: { ProjectId: this.ProjectId },
            attributes: ['id', 'order', 'createdAt']
          }, {
            transaction: t,
            lock: t.LOCK.UPDATE
          });
          collections.sort(function(a, b) {
            if (typeof a.order === 'number' && typeof b.order === 'number') {
              return a.order - b.order;
            } else {
              return a.createdAt - b.createdAt;
            }
          });
          var thisInstance, i;
          for (i = 0; i < collections.length; ++i) {
            if (collections[i].id === this.id) {
              thisInstance = collections[i];
              collections.splice(i, 1);
              break;
            }
          }
          collections.splice(order, 0, thisInstance);
          for (i = 0; i < collections.length; ++i) {
            if (collections[i].order !== i) {
              yield collections[i].updateAttributes({ order: i }, { transaction: t, silent: true });
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

function removeUnnessaryPropertiesAndSort(array) {
  array = array.sort(function(a, b) {
    if (typeof a.order === 'number' && typeof b.order === 'number') {
      return a.order - b.order;
    } else {
      return a.createdAt - b.createdAt;
    }
  });
  array.forEach(function(obj) {
    delete obj.isChild;
    delete obj.parentUUID;
    delete obj.order;
    if (obj.children.length) {
      obj.children = removeUnnessaryPropertiesAndSort(obj.children);
    } else {
      delete obj.children;
    }
  });
  return array;
}
