describe('Model.ProjectTeam', function() {
  describe('.higherPermission()', function() {
    it('should compare permissions correctly', function() {
      expect(ProjectTeam.higherPermission('read')).to.eql('read');
      expect(ProjectTeam.higherPermission('read', null)).to.eql('read');
      expect(ProjectTeam.higherPermission('read', 'write')).to.eql('write');
      expect(ProjectTeam.higherPermission('read', 'write', 'admin', 'admin')).to.eql('admin');
    });
  });
});
