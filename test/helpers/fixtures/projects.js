exports.load = function() {
  var projects = [
    Project.build({
      name: 'project0',
    }),
    Project.build({
      name: 'project1',
    }),
    Project.build({
      name: 'project2',
    }),
    Project.build({
      name: 'project3',
    }),
    Project.build({
      name: 'project4',
    })
  ];

  return Promise.all(projects.map(function(project) {
    return project.save();
  }));
};
