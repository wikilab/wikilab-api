var TreeModel = require('tree-model');

module.exports = function(DataTypes) {
  return [{
    name: {
      type: DataTypes.STRING,
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
    }
  }];
};
