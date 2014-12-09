var TreeModel = require('tree-model');

module.exports = function(DataTypes) {
  return [{
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dirs: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    instanceMethods: {
      insertIntoDirs: function(UUID, parentUUID) {
        var tree = new TreeModel();
        var dirs = tree.parse(JSON.parse(this.dirs));
        var parent;
        if (parentUUID) {
          parent = dirs.first(function(node) {
            return node.model.UUID === parent;
          });
        }
        if (!parent) {
          parent = dirs;
        }
        parent.addChild(tree.parse({ UUID: UUID }));
        this.dirs = JSON.stringify(dirs.model);
        return this.save(['dirs']);
      }
    },
    validate: {
      dirsTree: function(next) {
        var dirs = this.dirs;
        try {
          dirs = JSON.parse(dirs);
        } catch (e) {
          return next(e);
        }
        if (typeof dirs !== 'object' || dirs === null) {
          return next(new Error('dirs should be an object'));
        }
        var tree = new TreeModel();
        dirs = tree.parse(this.dirs);

        this.getDocs({
          where: { current: true },
          attributes: ['UUID']
        }).then(function(documents) {
          var UUIDs = documents.map(function(doc) {
            return doc.UUID;
          });
          var allowedProperty = ['children', 'UUID'];
          var removeNode = [];
          dirs.walk(function(node) {
            Object.keys(node.model).forEach(function(key) {
              if (allowedProperty.indexOf(key) === -1) {
                delete node.model[key];
              }
            });
            var index = UUIDs.indexOf(node.model.UUID);
            if (index === -1) {
              removeNode.push(node);
            } else {
              UUIDs.splice(index, 1);
            }
          });
          removeNode.forEach(function(node) { node.drop(); });
          UUIDs.forEach(function(UUID) {
            dirs.addChild(tree.parse({ UUID: UUID }));
          });

          this.dirs = JSON.stringify(dirs.model);
          next();
        });
      }
    }
  }];
};
