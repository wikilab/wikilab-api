describe('Model.Team', function() {
  beforeEach(function() {
    return fixtures.load('teams');
  });

  it('should reject when create a duplicate owner team', function() {
    return Team.create({
      name: 'name',
      type: 'owner'
    }).then(function(team) {
      throw new Error('should reject');
    }).catch(function(err) {
      expect(err).to.have.property('message', 'Owner team is existed');
    });
  });
});
