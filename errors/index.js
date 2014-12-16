var errors = require('node-require-directory')(__dirname);
var inflection = require('inflection');
var util = require('util');

Object.keys(errors).forEach(function(key) {
  var errorClassName = inflection.classify(key);
  var errorDefinition = errors[key];
  var error = exports[errorClassName] = function() {
    Error.call(this);
    if (typeof errorDefinition.message === 'function') {
      this.message = errorDefinition.message.apply(this, arguments);
    } else if (arguments.length > 0) {
      this.message = util.format.apply(null, arguments);
    }
  };
  util.inherits(error, Error);
  error.prototype.name = errorClassName;
  if (typeof errorDefinition.message === 'string') {
    error.prototype.message = errorDefinition.message;
  }
  error.prototype.status = errorDefinition.status;
});
