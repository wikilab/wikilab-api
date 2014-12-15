exports.load = function *() {
  return [
    yield Project.create({
      name: 'project0',
    }),
    yield Project.create({
      name: 'project1',
    }),
    yield Project.create({
      name: 'project2',
    }),
    yield Project.create({
      name: 'project3',
    }),
    yield Project.create({
      name: 'project4',
    })
  ];
};
