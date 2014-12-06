require('../../../env');

var users = [
  User.build({
    email: 'bob@email.com',
    name: 'Bob',
    password: 'bobpassword'
  }),
  User.build({
    email: 'jeff@email.com',
    name: 'Jeff',
    password: 'jeffpassword'
  })
];

exports.users = users;

exports.load = function() {
  return Promise.all(users.map(function(user) {
    return user.save();
  }));
};

exports.unload = function() {
  return User.remove({});
};
