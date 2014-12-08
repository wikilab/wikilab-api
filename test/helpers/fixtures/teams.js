exports.load = function() {
  var teams = [
    Team.build({
      name: 'Owner',
      type: 'owner'
    }),
    Team.build({
      name: 'User',
      type: 'user'
    })
  ];

  return Promise.all(teams.map(function(team) {
    return team.save();
  }));
};
