exports.load = function *() {
  return [
    yield User.create({
      email: 'bob@email.com',
      name: 'Bob',
      password: 'bobpassword',
      isOwner: true
    }),
    yield User.create({
      email: 'jeff@email.com',
      name: 'Jeff',
      password: 'jeffpassword'
    })
  ];
};
