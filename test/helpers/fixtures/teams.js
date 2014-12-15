exports.load = function *() {
  return [
    yield Team.create({
      name: 'Owner'
    }),
    yield Team.create({
      name: 'User1'
    }),
    yield Team.create({
      name: 'User2'
    }),
    yield Team.create({
      name: 'User3'
    }),
    yield Team.create({
      name: 'User4'
    }),
    yield Team.create({
      name: 'User5'
    })
  ];
};
