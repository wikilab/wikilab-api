var router = module.exports = new (require('koa-router'))();

router.get('/:projectId/collections/:collectionId', function *() {
  yield this.render('index');
});
