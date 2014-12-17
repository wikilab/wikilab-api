module.exports = function(DataTypes) {
  return [{
    name: {
      type: DataTypes.STRING,
      allowNull: false
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
