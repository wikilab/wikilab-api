exports.load = function() {
  var teams = [
    Team.build({
      name: 'Owner',
      type: 'owner'
    }),
    Team.build({
      name: 'User1',
      type: 'user'
    }),
    Team.build({
      name: 'User2',
      type: 'user'
    }),
    Team.build({
      name: 'User3',
      type: 'user'
    }),
    Team.build({
      name: 'User4',
      type: 'user'
    }),
    Team.build({
      name: 'User5',
      type: 'user'
    })
  ];

  return Promise.all(teams.map(function(team) {
    return team.save();
  }));
};
