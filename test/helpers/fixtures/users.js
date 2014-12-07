exports.load = function() {
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

  return Promise.all(users.map(function(user) {
    return user.save();
  }));
};
