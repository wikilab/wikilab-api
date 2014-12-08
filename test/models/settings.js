describe('Model.Setting', function() {
  beforeEach(function() {
    return fixtures.load('settings');
  });

  describe('.get()', function() {
    it('should get and parse the setting', function() {
      return Setting.get(fixtures.settings[0].key).then(function(value) {
        expect(value).to.eql(JSON.parse(fixtures.settings[0].value));
      });
    });

    it('should return the default value when the key is not found', function() {
      return Setting.get('not existed', { pass: true }).then(function(value) {
        expect(value).to.eql({ pass: true });
      });
    });
  });

  describe('.set()', function() {
    it('should override the existed key', function() {
      return Setting.set(fixtures.settings[0].key, false).then(function(instance) {
        expect(instance.value).to.eql(JSON.stringify(false));
        return expect(Setting.get(fixtures.settings[0].key)).to.become(false);
      });
    });

    it('should create a new key when not existed', function() {
      var newValue = { pass: true };
      return Setting.set('not existed', newValue).then(function(instance) {
        expect(instance.value).to.eql(JSON.stringify(newValue));
        return expect(Setting.get('not existed')).to.become(newValue);
      });
    });
  });
});
