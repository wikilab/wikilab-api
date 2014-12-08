exports.load = function() {
  var settings = [
    Setting.build({
      key: 'setting0',
      value: JSON.stringify(true)
    }),
    Setting.build({
      key: 'setting1',
      value: JSON.stringify({
        value: 'value1'
      })
    })
  ];

  return Promise.all(settings.map(function(setting) {
    return setting.save();
  }));
};
