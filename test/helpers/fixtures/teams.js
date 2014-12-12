exports.load = function() {
  var teams = [
    Team.build({
      name: 'Owner'
    }),
    Team.build({
      name: 'User1'
    }),
    Team.build({
      name: 'User2'
    }),
    Team.build({
      name: 'User3'
    }),
    Team.build({
      name: 'User4'
    }),
    Team.build({
      name: 'User5'
    })
  ];

  return Promise.all(teams.map(function(team) {
    return team.save();
  }));
};
