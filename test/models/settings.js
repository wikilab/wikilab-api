describe('Model.Setting', function() {
  beforeEach(function *() {
    yield fixtures.load('settings');
  });

  describe('.get()', function() {
    it('should get and parse the setting', function *() {
      var value = yield Setting.get(fixtures.settings[0].key);
      expect(value).to.eql(JSON.parse(fixtures.settings[0].value));
    });

    it('should return the default value when the key is not found', function *() {
      var value = yield Setting.get('not existed', { pass: true });
      expect(value).to.eql({ pass: true });
    });
  });

  describe('.set()', function() {
    it('should override the existed key', function *() {
      var key = fixtures.settings[0].key;
      var instance = yield Setting.set(key, false);
      expect(instance.value).to.eql(JSON.stringify(false));
      expect(yield Setting.get(key)).to.eql(false);
    });

    it('should create a new key when not existed', function *() {
      var newValue = { pass: true };
      var instance = yield Setting.set('not existed', newValue);
      expect(instance.value).to.eql(JSON.stringify(newValue));
      expect(yield Setting.get('not existed')).to.eql(newValue);
    });
  });
});
