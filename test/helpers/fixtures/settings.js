exports.load = function *() {
  return [
    yield Setting.create({
      key: 'setting0',
      value: JSON.stringify(true)
    }),
    yield Setting.create({
      key: 'setting1',
      value: JSON.stringify({
        value: 'value1'
      })
    })
  ];
};
