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
        var treeDoc = {};
        docs = docs.map(function(doc) {
          doc = doc.dataValues;
          treeDoc[doc.UUID] = doc;
          doc.children = [];
          return doc;
        });
        docs.forEach(function(doc) {
          if (doc.parentUUID) {
            treeDoc[doc.parentUUID].children.push(doc);
            doc.isChild = true;
          }
        });
        docs = [];
        Object.keys(treeDoc).forEach(function(key) {
          if (!treeDoc[key].isChild) {
            docs.push(treeDoc[key]);
          }
        });
        this.collection.setDataValue('dirs', docs);
      }
    }
  }];
};
