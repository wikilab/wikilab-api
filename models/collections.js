module.exports = function(DataTypes) {
  return [{
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    instanceMethods: {
      getDirs: function *() {
        var docs = yield this.getDocs({ attributes: ['UUID', 'parentUUID', 'title'] });
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
        removeUnnessaryProperties(dirs);
        return dirs;
      }
    }
  }];
};

function removeUnnessaryProperties(obj) {
  if (Array.isArray(obj)) {
    return obj.forEach(removeUnnessaryProperties);
  }
  delete obj.isChild;
  delete obj.parentUUID;
  if (obj.children.length) {
    removeUnnessaryProperties(obj.children);
  } else {
    delete obj.children;
  }
}
