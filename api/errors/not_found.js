var format = require('util').format;
exports.status = 404;
exports.message = function(resourceName) {
  format('%s is not found', format.apply(null, arguments) || 'The resource');
};
